import { UserProject } from '@/schemas/user_project.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserProjectService {
  constructor(
    @InjectModel(UserProject.name)
    private readonly userProjectModel: Model<UserProject>,
  ) {}

  async create(userProject: UserProject): Promise<UserProject> {
    const result = this.userProjectModel.create(userProject);
    return result;
  }

  async findOne(
    userId: string,
    projectId: string,
  ): Promise<UserProject | null> {
    const result = this.userProjectModel.findOne({
      user_id: userId,
      project_id: projectId,
    });
    return result;
  }

  async isApplied(userId: string, projectId: string): Promise<boolean> {
    const result = await this.userProjectModel.findOne({
      user_id: userId,
      project_id: projectId,
    });
    return !!result;
  }
}
