import { Module } from '@nestjs/common';
import { EducationsService } from './educations.service';
import { EducationsResolver } from './educations.resolver';

@Module({
  providers: [EducationsResolver, EducationsService],
})
export class EducationsModule {}
