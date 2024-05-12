import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ProjectInvestingInfo } from '@/schemas/project_investing_info.schema';
import { FindByProjectIdParams } from './project-investing-info.type';

@Injectable()
export class ProjectInvestingInfoService {
  constructor(
    @InjectModel(ProjectInvestingInfo.name)
    private readonly projectInvestingInfoModel: Model<ProjectInvestingInfo>,
  ) {}

  async findByProjectId(
    params: FindByProjectIdParams,
  ): Promise<ProjectInvestingInfo | null> {
    if (!params.project_id) {
      throw new BadRequestException('project_id is required');
    }
    const result = await this.projectInvestingInfoModel.findOne({
      project_id: params.project_id,
    });
    return result;
  }
}
