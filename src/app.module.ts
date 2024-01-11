import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { PrismaModule } from './common/prisma/prisma.module'
import { MapperModule } from './common/mappers/mapper.module'
import { SkillsModule } from './skills/skills.module'
import { ProjectsModule } from './projects/projects.module'
import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from '@auth/guards/jwt.guard'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    MapperModule,
    SkillsModule,
    ProjectsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
