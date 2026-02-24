import { Module } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { ExperiencesResolver } from './experiences.resolver';

@Module({
  providers: [ExperiencesResolver, ExperiencesService],
})
export class ExperiencesModule {}
