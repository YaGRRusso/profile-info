import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { compact, isNil, maxBy, minBy } from "lodash";
import { Model, type PipelineStage } from "mongoose";
import { clearObject } from "@/common/helpers/object.helper";
import { tenantPersistenceScope } from "@/core/context/auth-context.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { SortEnum } from "@/core/enums/sort.enum";
import { i18nKey } from "@/core/i18n/i18n";
import { type IdLike, toIdString } from "@/core/mappers/base.mapper";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/core/persistence/consts/limits.const";
import { CrudRepository } from "@/core/persistence/repositories/crud/crud.repository";
import { StatsRepository } from "@/core/persistence/repositories/stats/stats.repository";
import type { MultiPaged } from "@/core/persistence/types/output.type";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { FilterExperienceInput } from "./dto/filter-experience.input";
import { SortExperienceInput } from "./dto/sort-experience.input";
import { SortGroupedExperienceInput } from "./dto/sort-grouped-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";
import type { ExperienceEntityRecord } from "./entities/experience.entity";
import type { GroupedExperienceEntityRecord } from "./entities/grouped-experience.entity";
import { ExperienceMapper } from "./mappers/experience.mapper";
import { ExperienceModel } from "./schemas/experience.schema";

interface AggregatedExperienceGroup {
  _id: IdLike;
  createdAt: Date;
  experiences: ExperienceModel[];
  ownerId: IdLike;
  relevance: number;
  updatedAt: Date;
}

interface GroupedAggregatePage {
  metadata: Array<{ found: number }>;
  nodes: AggregatedExperienceGroup[];
}

function toMongoSort(sort: Record<string, SortEnum>): Record<string, 1 | -1> {
  return Object.fromEntries(
    Object.entries(sort).map(([field, direction]) => [
      field,
      direction === SortEnum.ASC ? 1 : -1,
    ])
  );
}

@Injectable()
export class ExperiencesRepository {
  private readonly model: Model<ExperienceModel>;
  private readonly mapper = new ExperienceMapper();
  readonly crud: CrudRepository<
    ExperienceModel,
    ExperienceEntityRecord,
    CreateExperienceInput,
    UpdateExperienceInput,
    FilterExperienceInput,
    SortExperienceInput
  >;
  readonly stats: StatsRepository<ExperienceModel>;

  constructor(
    @InjectModel(ExperienceModel.name) model: Model<ExperienceModel>
  ) {
    this.model = model;
    this.crud = new CrudRepository(model, this.mapper);
    this.stats = new StatsRepository(model);
  }

  tenantCrud(ctx: AuthContext) {
    return this.crud.scoped(tenantPersistenceScope(ctx));
  }

  tenantStats(ctx: AuthContext) {
    return this.stats.scoped(tenantPersistenceScope(ctx));
  }

  async findManyGrouped(
    ctx: AuthContext,
    {
      filters,
      limit = DEFAULT_PAGE_SIZE,
      skip = 0,
      sort,
    }: {
      filters?: FilterExperienceInput;
      limit?: number;
      skip?: number;
      sort?: SortGroupedExperienceInput;
    }
  ): Promise<MultiPaged<GroupedExperienceEntityRecord>> {
    const resolvedLimit = Math.min(limit, MAX_PAGE_SIZE);
    const filterValue = clearObject(filters);
    const persistenceFilter = filterValue
      ? this.mapper.toPersistenceForFilter(filterValue)
      : {};

    const { forAggregate, forRead } = tenantPersistenceScope(ctx).query;
    const scopedFilter = forAggregate
      ? forAggregate(persistenceFilter as never)
      : forRead(persistenceFilter as never);

    const pipeline: PipelineStage[] = [];
    if (Object.keys(scopedFilter).length > 0) {
      pipeline.push({ $match: scopedFilter });
    }

    const withinGroupSort: Record<string, 1 | -1> = {
      relevance: -1,
    };
    withinGroupSort["period.from"] = -1;

    pipeline.push(
      { $sort: withinGroupSort },
      {
        $group: {
          _id: "$organizationId",
          createdAt: { $min: "$createdAt" },
          experiences: { $push: "$$ROOT" },
          ownerId: { $first: "$ownerId" },
          relevance: { $max: "$relevance" },
          updatedAt: { $min: "$updatedAt" },
        },
      },
      {
        $sort: toMongoSort({
          relevance: SortEnum.DESC,
          ...clearObject(sort),
        }),
      },
      {
        $facet: {
          metadata: [{ $count: "found" }],
          nodes: [{ $skip: skip }, { $limit: resolvedLimit }],
        },
      }
    );

    const [page] = await this.model
      .aggregate<GroupedAggregatePage>(pipeline)
      .exec();

    return {
      found: page?.metadata[0]?.found ?? 0,
      nodes: (page?.nodes ?? []).map((group) => this.toGroupedRecord(group)),
    };
  }

  async findOneGrouped(
    ctx: AuthContext,
    options: {
      filters?: FilterExperienceInput;
      sort?: SortGroupedExperienceInput;
    }
  ): Promise<GroupedExperienceEntityRecord> {
    const { nodes } = await this.findManyGrouped(ctx, {
      ...options,
      limit: 1,
    });
    const [group] = nodes;

    if (!group) {
      throw new NotFoundException(
        i18nKey("persistence.NOT_FOUND", { resource: "GroupedExperience" })
      );
    }

    return group;
  }

  private toGroupedRecord(
    group: AggregatedExperienceGroup
  ): GroupedExperienceEntityRecord {
    const experiences = group.experiences.map((document) =>
      this.mapper.toDomain({
        ...document,
        id: toIdString(document._id ?? document.id),
      } as ExperienceModel)
    );

    return {
      createdAt: group.createdAt,
      experiences,
      organizationId: toIdString(group._id),
      ownerId: toIdString(group.ownerId) ?? "",
      period: toGroupPeriod(experiences),
      relevance: group.relevance,
      updatedAt: group.updatedAt,
    };
  }

  async detachSkill(skillId: string): Promise<void> {
    await this.model
      .updateMany({ skillIds: skillId }, { $pull: { skillIds: skillId } })
      .exec();
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.model.deleteMany({ organizationId }).exec();
  }

  async purgeByOwner(ownerId: string): Promise<void> {
    await this.model.deleteMany({ ownerId }).exec();
  }

  countByOwners(ownerIds: string[]) {
    return this.stats.global().countByOwnerIds(ownerIds);
  }
}

function toGroupPeriod(
  experiences: ExperienceEntityRecord[]
): GroupedExperienceEntityRecord["period"] {
  const from = minBy(
    compact(experiences.map((experience) => experience.period?.from)),
    (date) => date.getTime()
  );
  const hasCurrentRole = experiences.some((experience) =>
    isNil(experience.period?.to)
  );
  const to = hasCurrentRole
    ? undefined
    : maxBy(
        compact(experiences.map((experience) => experience.period?.to)),
        (date) => date.getTime()
      );

  return from || to ? { from, to } : undefined;
}
