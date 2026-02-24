import { Injectable } from "@nestjs/common";
import { CreateExperienceInput } from "./dto/create-experience.input";
import { UpdateExperienceInput } from "./dto/update-experience.input";

@Injectable()
export class ExperiencesService {
  create(createExperienceInput: CreateExperienceInput) {
    return "This action adds a new experience";
  }

  findAll() {
    return "This action returns all experiences";
  }

  findOne(id: string) {
    return `This action returns a #${id} experience`;
  }

  update(id: string, updateExperienceInput: UpdateExperienceInput) {
    return `This action updates a #${id} experience`;
  }

  remove(id: string) {
    return `This action removes a #${id} experience`;
  }
}
