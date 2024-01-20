import { PartialType } from '@nestjs/swagger'
import { CreateCourseDto } from './create-course.dto'

export class SearchCourseDto extends PartialType(CreateCourseDto) {}
