import { Injectable } from "@nestjs/common";
import { CreateEducationInput } from "./dto/create-education.input";
import { UpdateEducationInput } from "./dto/update-education.input";

@Injectable()
export class EducationsService {
  create(createEducationInput: CreateEducationInput) {
    console.log(createEducationInput);
    return "This action adds a new education";
  }

  findAll() {
    return "This action returns all educations";
  }

  findOne(id: string) {
    return `This action returns a #${id} education`;
  }

  update(id: string, updateEducationInput: UpdateEducationInput) {
    console.log(updateEducationInput);
    return `This action updates a #${id} education`;
  }

  remove(id: string) {
    return `This action removes a #${id} education`;
  }
}
