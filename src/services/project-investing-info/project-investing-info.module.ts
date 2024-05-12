import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectInvestingInfoService } from './project-investing-info.service';
import {
  ProjectInvestingInfo,
  ProjectInvestingInfoSchema,
} from '@/schemas/project_investing_info.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProjectInvestingInfo.name,
        schema: ProjectInvestingInfoSchema,
      },
    ]),
  ],
  providers: [ProjectInvestingInfoService],
  exports: [ProjectInvestingInfoService],
})
export class ProjectInvestingInfoModule {}
