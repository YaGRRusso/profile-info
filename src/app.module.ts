import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { PrismaModule } from './common/prisma/prisma.module'
import { MapperModule } from './common/mappers/mapper.module'
import { SkillsModule } from './skills/skills.module'

@Module({
  imports: [UsersModule, PrismaModule, MapperModule, SkillsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
