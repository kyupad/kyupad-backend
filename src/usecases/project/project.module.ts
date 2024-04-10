import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectServiceModule } from '@/services/project/project.module';

@Module({
  imports: [ProjectServiceModule],
  controllers: [ProjectController],
})
export class ProjectModule {}
