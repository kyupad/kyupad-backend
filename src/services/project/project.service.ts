import { Project, Timeline } from '@/schemas/project.schema';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { UserProject } from '@/schemas/user_project.schema';
import { EProjectProgressStatus, EProjectStatus } from '@/enums';
import { ProjectDetailDto } from '@usecases/project/project.response';
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

  async listUpcoming(params: {
    limit?: number;
    page?: number;
  }): Promise<{ data: Project[]; totalCount: number }> {
    const perPage = Number(params?.limit) || 4;
    const page = params?.page || 1;

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
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [
            { $sort: { registration_start_at_diff: 1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage },
          ],
        },
      },
      {
        $unwind: '$totalCount',
      },
      {
        $project: {
          totalCount: '$totalCount.count',
          data: 1,
        },
      },
    ]);

    return result?.[0] || [];
  }

  async listSuccess(params: {
    limit?: number;
    page?: number;
  }): Promise<{ data: Project[]; totalCount: number }> {
    const perPage = Number(params?.limit) || 3;
    const page = params?.page || 1;

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
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [
            { $sort: { registration_start_at_diff: 1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage },
          ],
        },
      },
      {
        $unwind: '$totalCount',
      },
      {
        $project: {
          totalCount: '$totalCount.count',
          data: 1,
        },
      },
    ]);

    return result?.[0] || [];
  }

  async isExist(id: string): Promise<boolean> {
    const result = await this.projectModel.exists({ id: id });
    return !!result?._id;
  }

  async findProjectById(id: string): Promise<Project | null> {
    const result = await this.projectModel.findOne({
      id,
    });
    return result;
  }

  async findProjectBySlug(
    slug: string,
    filter?: FilterQuery<Project>,
    select?: { [key in keyof FilterQuery<Project>]: 1 | 0 },
  ): Promise<Project> {
    const project = await this.projectModel
      .findOne({
        ...filter,
        slug,
      })
      .select(select || {});
    if (!project) throw new NotFoundException('Project not found');
    return project;
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
    const projectInfo = JSON.parse(JSON.stringify(project)) as Project;
    const projectDetail: ProjectDetailDto = {
      project: plainToInstance(Project, JSON.parse(JSON.stringify(project))),
      progress_status: this.getProjectProgressStatus(projectInfo.timeline),
    };
    if (wallet) {
      const [myUserProject, aggregateUserRegisterProjectResult] =
        await Promise.all([
          this.userProjectModel.findOne({
            project_id: String(project.id),
            user_id: wallet,
          }),
          this.aggregateUsersProjectAssets(String(project?.id)),
        ]);
      if (myUserProject) projectDetail.is_applied = true;
      if (aggregateUserRegisterProjectResult)
        projectDetail.users_assets = aggregateUserRegisterProjectResult;
    } else {
      const aggregateUserRegisterProjectResult =
        await this.aggregateUsersProjectAssets(String(project?.id));
      if (aggregateUserRegisterProjectResult) {
        delete aggregateUserRegisterProjectResult._id;
        projectDetail.users_assets = aggregateUserRegisterProjectResult;
      }
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
        result.total_assets = Number((result.total_assets || 0).toFixed(3));
      }
      return result;
    } catch (e) {
      this.logger.error(
        `Cannot aggregateUsersProjectAssets of project [${projectId}], ${e.stack}`,
      );
    }
  }

  getProjectProgressStatus(projectTimeLine: Timeline): EProjectProgressStatus {
    let progressStatus = EProjectProgressStatus.UP_COMING;
    const currentTime = new Date().getTime();
    if (
      new Date(projectTimeLine?.registration_start_at).getTime() <= currentTime
    )
      progressStatus = EProjectProgressStatus.REGISTRATION;
    if (new Date(projectTimeLine?.snapshot_start_at).getTime() <= currentTime)
      progressStatus = EProjectProgressStatus.SNAPSHOTTING;
    if (new Date(projectTimeLine?.investment_start_at).getTime() <= currentTime)
      progressStatus = EProjectProgressStatus.INVESTING;
    if (new Date(projectTimeLine?.claim_start_at).getTime() <= currentTime)
      progressStatus = EProjectProgressStatus.VESTING;
    if (new Date(projectTimeLine?.claim_end_at).getTime() <= currentTime)
      progressStatus = EProjectProgressStatus.FINISHED;

    return progressStatus;
  }
}
