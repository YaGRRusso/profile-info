import { Injectable } from "@nestjs/common";
import { AnyKeys, QueryFilter, SortOrder, UpdateQuery } from "mongoose";
import {
  labelFromI18nTitle,
  RecentActivityRecord,
} from "@/common/helpers/recent-activity.helper";
import type { AuthContext } from "@/core/context/auth-context.interface";
import { BatchEntity } from "@/core/entities/batch.entity";
import { PaginatedModel } from "@/core/schemas/paginated.schema";
import { EducationModel } from "@/modules/educations/schemas/education.schema";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";
import { EducationsRepository } from "./educations.repository";

@Injectable()
export class EducationsService {
  constructor(private readonly repository: EducationsRepository) {}

  findOneById(_ctx: AuthContext | null, id: string): Promise<EducationModel> {
    return this.repository.findOneById(id);
  }

  findOne(
    _ctx: AuthContext | null,
    {
      filters,
    }: {
      filters?: QueryFilter<EducationModel>;
    }
  ): Promise<EducationModel> {
    return this.repository.findOne({ filters });
  }

  findManyById(
    _ctx: AuthContext | null,
    ids: string[]
  ): Promise<EducationModel[]> {
    return this.repository.findManyById(ids);
  }

  findMany(
    _ctx: AuthContext | null,
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
    _ctx: AuthContext | null,
    createInput: CreateEducationInput
  ): Promise<EducationModel> {
    return this.repository.createOne(createInput as AnyKeys<EducationModel>);
  }

  createMany(
    _ctx: AuthContext | null,
    createInputs: CreateEducationInput[]
  ): Promise<BatchEntity> {
    return this.repository.createMany(
      createInputs as AnyKeys<EducationModel>[]
    );
  }

  updateOne(
    _ctx: AuthContext | null,
    id: string,
    updateInput: UpdateEducationInput
  ): Promise<EducationModel> {
    return this.repository.updateOneById(
      id,
      updateInput as object as UpdateQuery<EducationModel>
    );
  }

  updateMany(
    _ctx: AuthContext | null,
    ids: string[],
    updateInput: UpdateEducationInput
  ): Promise<BatchEntity> {
    return this.repository.updateManyById(
      ids,
      updateInput as object as UpdateQuery<EducationModel>
    );
  }

  removeOne(_ctx: AuthContext | null, id: string): Promise<EducationModel> {
    return this.repository.deleteOneById(id);
  }

  removeMany(_ctx: AuthContext | null, ids: string[]): Promise<BatchEntity> {
    return this.repository.deleteManyById(ids);
  }

  count(): Promise<number> {
    return this.repository.stats.count();
  }

  async findRecentActivity(limit: number): Promise<RecentActivityRecord[]> {
    const rows = await this.repository.stats.findRecentlyUpdated(
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

  async detachSkill(skillId: string): Promise<void> {
    await this.repository.updateMany(
      { skillIds: skillId },
      { $pull: { skillIds: skillId } }
    );
  }

  async purgeByOrganization(organizationId: string): Promise<void> {
    await this.repository.deleteMany({ organizationId });
  }
}
