import { Project } from '@/schemas/project.schema';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { UserProject } from '@/schemas/user_project.schema';
import { EProjectStatus } from '@/enums';
import {
  ProjectDetailDto,
  ProjectDto,
} from '@usecases/project/project.response';

dayjs.extend(utc);

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(UserProject.name)
    private readonly userProjectModel: Model<UserProject>,
    @InjectConnection() private readonly connection: mongoose.Connection,
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

  async listUpcoming(params: {
    limit?: number;
    skip?: number;
  }): Promise<Project[]> {
    const result = await this.projectModel.aggregate([
      {
        $match: {
          'timeline.investment_end_at': { $gte: dayjs.utc().toDate() },
          status: EProjectStatus.ACTIVE,
        },
      },
      {
        $addFields: {
          registration_start_at_diff: {
            $cond: {
              if: {
                $gt: ['$timeline.registration_start_at', dayjs.utc().toDate()],
              },
              then: {
                $subtract: [
                  '$timeline.registration_start_at',
                  dayjs.utc().toDate(),
                ],
              },
              else: Number.MAX_SAFE_INTEGER,
            },
          },
        },
      },
      {
        $sort: { registration_start_at_diff: 1 },
      },
      {
        $limit: Number(params?.limit) || 4,
      },
      {
        $skip: Number(params?.skip) || 0,
      },
    ]);

    return result;
  }

  async listSuccess(params: {
    limit?: number;
    skip?: number;
  }): Promise<Project[]> {
    const result = await this.projectModel.aggregate([
      {
        $match: {
          'timeline.investment_end_at': { $lt: dayjs.utc().toDate() },
          status: EProjectStatus.ACTIVE,
        },
      },
      {
        $addFields: {
          registration_start_at_diff: {
            $cond: {
              if: {
                $gt: ['$timeline.registration_start_at', dayjs.utc().toDate()],
              },
              then: {
                $subtract: [
                  '$timeline.registration_start_at',
                  dayjs.utc().toDate(),
                ],
              },
              else: Number.MAX_SAFE_INTEGER,
            },
          },
        },
      },
      {
        $sort: { registration_start_at_diff: 1 },
      },
      {
        $limit: Number(params?.limit) || 3,
      },
      {
        $skip: Number(params?.skip) || 0,
      },
    ]);

    return result;
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const result = await this.projectModel.findOne({ slug });
    return result;
  }

  async isExist(id: string): Promise<boolean> {
    const result = await this.projectModel.exists({ id: id });
    return !!result?._id;
  }

  async findUserProject(
    project_id: string,
    user_id: string,
  ): Promise<UserProject | null> {
    const result = await this.userProjectModel.findOne({ user_id, project_id });
    return result;
  }

  async findProjectById(id: string): Promise<Project | null> {
    const result = await this.projectModel.findOne({
      id,
    });
    return result;
  }

  async detail(
    projectSlug: string,
    wallet?: string,
  ): Promise<{ project: ProjectDto; is_applied?: boolean }> {
    let is_applied = false;
    const project = await this.projectModel.findOne({
      slug: projectSlug,
      status: EProjectStatus.ACTIVE,
    });
    if (!project) throw new NotFoundException('Project not found');
    const projectDetail: ProjectDto = { ...project };
    if (wallet) {
      const [myUserProject, totalTicketUserProject] = await Promise.all([
        this.userProjectModel.findOne({
          project_id: String(project.id),
          user_id: wallet,
        }),
        this.userProjectModel.countDocuments({
          project_id: String(project.id),
          total_ticket: {
            $gt: 0,
          },
        }),
      ]);
      if (myUserProject) is_applied = true;
      projectDetail.raffle_info = {
        total_owner_winning_tickets: myUserProject
          ? myUserProject.total_ticket || 0
          : 0,
        total_winner: totalTicketUserProject | 0,
      };
    }
    return {
      project,
      is_applied,
    };
  }
}
