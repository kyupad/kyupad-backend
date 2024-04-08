import { Project } from '@/schemas/project.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { UserProject } from '@/schemas/user_project.schema';

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

  async findBySlug(slug: string): Promise<Project | null> {
    const result = await this.projectModel.findOne({ slug });
    return result;
  }

  async createUserProject(userProject: UserProject): Promise<UserProject> {
    const result = await this.userProjectModel.create(userProject);
    return result;
  }

  async findUserProject(
    project_id: string,
    user_id: string,
  ): Promise<UserProject | null> {
    const result = await this.userProjectModel.findOne({ user_id, project_id });
    return result;
  }
}
