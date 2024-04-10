import { Module } from '@nestjs/common';
import { ProjectDetailController } from './detail.controller';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [ClsModule],
  controllers: [ProjectDetailController],
})
export class ProjectDetailModule {}
