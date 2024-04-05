import { Module } from '@nestjs/common';
import { ProjectListController } from './list.controller';
import { ProjectModule } from '@/services/project/project.module';

@Module({
  imports: [ProjectModule],
  controllers: [ProjectListController],
})
export class ProjectListModule {}
