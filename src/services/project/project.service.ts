import { Project } from '@/schemas/project.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { UserProject } from '@/schemas/user_project.schema';
import { isEmpty } from '@/helpers';

dayjs.extend(utc);

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(UserProject.name)
    private readonly userProjectModel: Model<UserProject>,
  ) {}

  async create(project: Project): Promise<Project> {
    const result = await this.projectModel.create(project);
    return result;
  }

  async update(id: string, data: Project): Promise<Project | null> {
    const result = await this.projectModel.findByIdAndUpdate(id, data);
    return result;
  }

  async delete(ids: string[]): Promise<void> {
    await this.projectModel.deleteMany({ _id: { $in: ids } });
  }

  async findAll(): Promise<Project[]> {
    const result = await this.projectModel.find().sort({ createdAt: 'desc' });
    return result;
  }

  async listUpcoming(): Promise<Project[]> {
    const result = await this.projectModel
      .find({
        'timeline.registration_end_at': {
          $gte: dayjs.utc().toDate(),
        },
      })
      .sort({ 'timeline.registration_end_at': 'desc' });

    if (isEmpty(result)) {
      const result = await this.projectModel
        .find()
        .sort({ 'timeline.registration_end_at': 'desc' })
        .limit(4);
      return result;
    }

    return result;
  }

  async listSuccess(): Promise<Project[]> {
    const result = await this.projectModel
      .find({
        'timeline.investment_end_at': {
          $lte: dayjs.utc().toDate(),
        },
      })
      .sort({ 'timeline.investment_end_at': 'desc' });

    return result;
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const result = await this.projectModel.findOne({ slug });
    return result;
  }

  async isExist(id: string): Promise<boolean> {
    const result = await this.userProjectModel.exists({ id: id });
    return !!result?._id;
  }
}
