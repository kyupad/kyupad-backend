import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectModule } from '@/services/project/project.module';

@Module({
  imports: [ProjectModule],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
