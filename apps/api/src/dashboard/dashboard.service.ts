import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CourseModel } from "@/schemas/course.schema";
import { EducationModel } from "@/schemas/education.schema";
import { ExperienceModel } from "@/schemas/experience.schema";
import { OrganizationModel } from "@/schemas/organization.schema";
import { ProjectModel } from "@/schemas/project.schema";
import { SkillModel } from "@/schemas/skill.schema";
import { DashboardCount, DashboardEntity } from "./entities/dashboard.entity";

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(SkillModel.name) readonly skillModel: Model<SkillModel>,
    @InjectModel(CourseModel.name) readonly courseModel: Model<CourseModel>,
    @InjectModel(EducationModel.name)
    readonly educationModel: Model<EducationModel>,
    @InjectModel(OrganizationModel.name)
    readonly organizationModel: Model<OrganizationModel>,
    @InjectModel(ProjectModel.name) readonly projectModel: Model<ProjectModel>,
    @InjectModel(ExperienceModel.name)
    readonly experienceModel: Model<ExperienceModel>
  ) {}

  private async countBy<T>(
    model: Model<T>,
    field: string
  ): Promise<DashboardCount[]> {
    const rows = await model.aggregate<{ _id: string; value: number }>([
      { $group: { _id: `$${field}`, value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);
    return rows.map((row) => ({ label: row._id, value: row.value }));
  }

  async getDashboard(): Promise<DashboardEntity> {
    const [
      skills,
      courses,
      educations,
      organizations,
      projects,
      experiences,
      skillsByCategory,
      experiencesByCategory,
      coursesByStatus,
    ] = await Promise.all([
      this.skillModel.countDocuments(),
      this.courseModel.countDocuments(),
      this.educationModel.countDocuments(),
      this.organizationModel.countDocuments(),
      this.projectModel.countDocuments(),
      this.experienceModel.countDocuments(),
      this.countBy(this.skillModel, "category"),
      this.countBy(this.experienceModel, "category"),
      this.countBy(this.courseModel, "status"),
    ]);

    return {
      totals: {
        skills,
        courses,
        educations,
        organizations,
        projects,
        experiences,
      },
      skillsByCategory,
      experiencesByCategory,
      coursesByStatus,
    };
  }
}
