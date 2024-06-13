import { Type } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray } from 'class-validator'

export class PaginationOutputDto {
  @ApiProperty({ type: 'number' })
  totalRecords: number

  @ApiProperty({ type: 'number' })
  currentPage: number

  @ApiProperty({ type: 'number' })
  perPage: number

  @ApiProperty({ type: 'number', required: false })
  nextPage?: number

  @ApiProperty({ type: 'number', required: false })
  prevPage?: number

  @ApiProperty({ type: 'number' })
  totalPages: number
}

export function PaginatedResponseDto<T>(model: Type<T>) {
  class PaginatedResponseDtoClass {
    @ApiProperty({ type: [model] })
    @IsArray()
    data: T[]

    @ApiProperty({ type: PaginationOutputDto })
    pagination: PaginationOutputDto
  }

  return PaginatedResponseDtoClass
}
