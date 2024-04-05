import { Module } from '@nestjs/common';
import { ProjectDetailController } from './detail.controller';
import { ProjectModule } from '@/services/project/project.module';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [ProjectModule, ClsModule],
  controllers: [ProjectDetailController],
})
export class ProjectDetailModule {}
