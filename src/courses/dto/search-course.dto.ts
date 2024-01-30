import { CreateCourseDto } from './create-course.dto'

import { PartialType } from '@nestjs/swagger'

export class SearchCourseDto extends PartialType(CreateCourseDto) {}
