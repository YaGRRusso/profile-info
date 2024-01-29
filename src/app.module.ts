import { JwtAuthGuard } from '@auth/guards/jwt.guard'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { MapperModule } from './common/mappers/mapper.module'
import { PrismaModule } from './common/prisma/prisma.module'
import { CoursesModule } from './courses/courses.module'
import { ExperiencesModule } from './experiences/experiences.module'
import { FormationsModule } from './formations/formations.module'
import { ProjectsModule } from './projects/projects.module'
import { SkillsModule } from './skills/skills.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    MapperModule,
    SkillsModule,
    ProjectsModule,
    AuthModule,
    FormationsModule,
    CoursesModule,
    ExperiencesModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
