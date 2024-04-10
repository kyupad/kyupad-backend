import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectServiceModule } from '@/services/project/project.module';
import { ClsModule } from 'nestjs-cls';
import { UserProjectServiceModule } from '@/services/user-project/user-project.module';

@Module({
  imports: [ProjectServiceModule, ClsModule, UserProjectServiceModule],
  controllers: [ProjectController],
})
export class ProjectModule {}
