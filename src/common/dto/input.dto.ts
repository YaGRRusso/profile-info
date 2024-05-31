import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString, IsOptional } from 'class-validator'

export class PaginationDto {
  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsNumberString()
  page?: string | number

  @ApiProperty({ type: 'string', required: false })
  @IsOptional()
  @IsNumberString()
  limit?: string | number
}
