import { CourseDto } from './course.dto'

import { PickType } from '@nestjs/swagger'

export class CreateCourseDto extends PickType(CourseDto, [
  'name',
  'school',
  'description',
  'status',
  'certificate',
  'hours',
  'skills',
]) {}
