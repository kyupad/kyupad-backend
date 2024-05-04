import { Project } from '@/schemas/project.schema';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { plainToInstance } from 'class-transformer';
import { UsesProjectAssets } from '@/services/user-project/user-project.response';

dayjs.extend(utc);

@Injectable()
export class ProjectService {
  private logger = new Logger(ProjectService.name);

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
  ): Promise<ProjectDetailDto> {
    const project = await this.projectModel.findOne({
      slug: projectSlug,
      status: EProjectStatus.ACTIVE,
    });
    if (!project) throw new NotFoundException('Project not found');
    const projectDetail: ProjectDetailDto = {
      project: plainToInstance(ProjectDto, JSON.parse(JSON.stringify(project))),
    };
    if (wallet) {
      const [
        myUserProject,
        totalTicketUserProject,
        aggregateUserRegisterProjectResult,
      ] = await Promise.all([
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
        this.aggregateUsersProjectAssets(String(project?.id)),
      ]);
      if (myUserProject) projectDetail.is_applied = true;
      projectDetail.project.raffle_info = {
        total_owner_winning_tickets: myUserProject
          ? myUserProject.total_ticket || 0
          : 0,
        total_winner: totalTicketUserProject | 0,
      };
      if (aggregateUserRegisterProjectResult)
        projectDetail.users_assets = aggregateUserRegisterProjectResult;
    } else {
      const aggregateUserRegisterProjectResult =
        await this.aggregateUsersProjectAssets(String(project?.id));
      if (aggregateUserRegisterProjectResult)
        projectDetail.users_assets = aggregateUserRegisterProjectResult;
    }
    return projectDetail;
  }

  async aggregateUsersProjectAssets(
    projectId: string,
  ): Promise<UsesProjectAssets | undefined> {
    try {
      let result: UsesProjectAssets = {
        total_assets: 0,
        participants: 0,
      };
      const aggregateResult =
        await this.userProjectModel.aggregate<UsesProjectAssets>([
          {
            $match: {
              project_id: projectId,
            },
          },
          {
            $group: {
              _id: null,
              total_assets: {
                $sum: '$total_assets',
              },
              participants: {
                $sum: 1,
              },
            },
          },
        ]);
      if (aggregateResult && aggregateResult.length > 0) {
        result = aggregateResult[0];
        result.total_assets = Number((result.total_assets || 0).toFixed(2));
      }
      return result;
    } catch (e) {
      this.logger.error(
        `Cannot aggregateUsersProjectAssets of project [${projectId}], ${e.stack}`,
      );
    }
  }
}
