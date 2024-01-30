import { MapperService } from './mapper.service'

import { Module } from '@nestjs/common'

@Module({
  imports: [],
  providers: [MapperService],
  exports: [MapperService],
})
export class MapperModule {}
