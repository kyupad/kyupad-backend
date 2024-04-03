import { Project } from '@/schemas/project.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {}

  async create(project: Project): Promise<Project> {
    const result = await this.projectModel.create(project);
    return result;
  }

  async findAllUpcoming(): Promise<Project[]> {
    const result = await this.projectModel
      .find()
      .where('registration_at')
      .gte(dayjs.utc().valueOf())
      .sort({ registration_at: 'asc' });
    return result;
  }

  async findAllSuccess(): Promise<Project[]> {
    const result = await this.projectModel
      .find()
      .where('claim_at')
      .lt(dayjs.utc().valueOf())
      .sort({ claim_at: 'asc' });
    return result;
  }
}
