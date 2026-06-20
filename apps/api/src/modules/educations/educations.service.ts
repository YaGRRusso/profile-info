import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import type { RequestContext } from "@/core/context/request-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsRepository } from "./educations.repository";

@Injectable()
export class EducationsService {
  constructor(private readonly repository: EducationsRepository) {}

  findOneById(
    _ctx: RequestContext | null,
    id: string
  ): Promise<EducationModel> {
    return this.repository.findOneById(id);
  }

  findOne(
    _ctx: RequestContext | null,
    {
      filters,
    }: {
      filters?: QueryFilter<EducationModel>;
    }
  ): Promise<EducationModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(
    _ctx: RequestContext | null,
    ids: string[]
  ): Promise<EducationModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany(
    _ctx: RequestContext | null,
    {
      filters,
      sort,
      skip = 0,
      limit = 50,
    }: {
      filters?: QueryFilter<EducationModel>;
      sort?: Partial<Record<keyof EducationModel, SortOrder>>;
      limit?: number;
      skip?: number;
    }
  ): Promise<PaginatedModel<EducationModel>> {
    return this.repository.findMany({ filters, sort, skip, limit });
  }

  createOne(
    _ctx: RequestContext | null,
    createInput: CreateEducationInput
  ): Promise<EducationModel> {
    return this.repository.createOne(createInput as AnyKeys<EducationModel>);
  }

  createMany(
    _ctx: RequestContext | null,
    createInputs: CreateEducationInput[]
  ): Promise<EducationModel[]> {
    return this.repository.createMany(
      createInputs as AnyKeys<EducationModel>[]
    );
  }

  updateOne(
    _ctx: RequestContext | null,
    id: string,
    updateInput: UpdateEducationInput
  ): Promise<EducationModel> {
    return this.repository.updateOne(
      id,
      updateInput as object as UpdateQuery<EducationModel>
    );
  }

  updateMany(
    _ctx: RequestContext | null,
    ids: string[],
    updateInput: UpdateEducationInput
  ): Promise<BatchEntity> {
    return this.repository.updateMany(
      ids,
      updateInput as object as UpdateQuery<EducationModel>
    );
  }

  removeOne(_ctx: RequestContext | null, id: string): Promise<EducationModel> {
    return this.repository.deleteOne(id);
  }

  removeMany(_ctx: RequestContext | null, ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteMany(ids);
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  async findRecentActivity(limit: number): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.findRecentlyUpdated(
      limit,
      "slug i18n updatedAt"
    );
    return rows.map((row) => ({
      label: labelFromI18nTitle(
        row.slug as string,
        row.i18n as Parameters<typeof labelFromI18nTitle>[1]
      ),
      updatedAt: row.updatedAt,
    }));
  }

  detachSkill(skillId: string): Promise<void> {
    return this.repository.updateManyByFilter(
      { skills: skillId },
      { $pull: { skills: skillId } }
    );
  }

  purgeByOrganization(organizationId: string): Promise<void> {
    return this.repository.deleteManyByFilter({ organization: organizationId });
  }
}
