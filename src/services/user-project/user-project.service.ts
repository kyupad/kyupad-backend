import { UserProject } from '@/schemas/user_project.schema';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AwsSQSService } from '@/services/aws/sqs/sqs.service';
import { ProjectService } from '@/services/project/project.service';
import { ICatnipAssetsSnapshotBody } from '@/services/project/project.input';
import { SeasonService } from '@/services/season/season.service';
import { EProjectProgressStatus, EProjectStatus } from '@/enums';
import { UserProjectRegistrationDto } from '@usecases/project/project.response';
import { Project } from '@schemas/project.schema';

@Injectable()
export class UserProjectService {
  constructor(
    @InjectModel(UserProject.name)
    private readonly userProjectModel: Model<UserProject>,
    @Inject(ProjectService)
    private readonly projectService: ProjectService,
    @Inject(AwsSQSService)
    private readonly awsSQSService: AwsSQSService,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @Inject(SeasonService)
    private readonly seasonService: SeasonService,
  ) {}

  async create(input: UserProject): Promise<UserProject> {
    const [project, userProject, season] = await Promise.all([
      this.projectService.findProjectById(input.project_id),
      this.userProjectModel.findOne({
        user_id: input.user_id,
        project_id: input.project_id,
      }),
      this.seasonService.activeSeason(),
    ]);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (userProject) throw new NotFoundException('You have joined the project');
    const session = await this.connection.startSession();
    const resultTrans = await session.withTransaction(async () => {
      const result = await this.userProjectModel.create([input], { session });
      await this.awsSQSService.createSQS<ICatnipAssetsSnapshotBody>({
        queue_url: process.env.AWS_QUEUE_URL as string,
        message_group_id: 'REGISTRATION_CATNIP_ASSET_SNAPSHOT',
        message_deduplication_id: result[0].id,
        message_body: {
          user_registration_id: result[0]._id,
          project_id: input.project_id || '',
          user_id: input.user_id,
          season_id: String(season?._id),
        },
      });
      return result[0];
    });
    await session.endSession();
    return resultTrans;
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

  async projectRegistrationInfo(
    projectSlug: string,
    wallet?: string,
  ): Promise<UserProjectRegistrationDto> {
    if (!wallet) throw new NotFoundException('Registration info not found');
    const project = await this.projectService.findProjectBySlug(
      projectSlug,
      {
        status: EProjectStatus.ACTIVE,
      },
      { timeline: 1, id: 1, info: 1 },
    );
    const projectInfo = JSON.parse(JSON.stringify(project)) as Project;
    const result: UserProjectRegistrationDto = {
      progress_status: this.projectService.getProjectProgressStatus(
        projectInfo.timeline,
      ),
      project_info: {
        ...projectInfo,
        id: String(project.id),
        info: undefined,
      },
    };
    await this.projectRegistrationInfoByProgressStatus(
      result,
      projectInfo,
      wallet,
    );
    return result;
  }

  async projectRegistrationInfoByProgressStatus(
    info: UserProjectRegistrationDto,
    projectInfo: Project,
    wallet: string,
  ): Promise<void> {
    if (info.progress_status === EProjectProgressStatus.REGISTRATION) {
      const userProject = await this.userProjectModel.findOne({
        project_id: info.project_info.id,
        user_id: wallet,
      });
      if (!userProject)
        throw new NotFoundException('Registration info not found');
      info.catnip_info = {
        catnip_point: userProject.total_assets || 0,
        multi_pier: userProject.multi_pier || 1,
      };
    }
    if (info.progress_status === EProjectProgressStatus.SNAPSHOTTING) {
      const aggregateUsersProjectAssetsInfo =
        await this.projectService.aggregateUsersProjectAssets(
          String(info.project_info.id),
        );
      if (aggregateUsersProjectAssetsInfo)
        delete aggregateUsersProjectAssetsInfo._id;
      info.users_assets = aggregateUsersProjectAssetsInfo || {
        total_assets: 0,
        participants: 0,
      };
    }
    if (info.progress_status === EProjectProgressStatus.INVESTING) {
      const { total_winner, total_owner_winning_tickets } =
        await this.projectService.aggregateUsersProjectTicket(
          info.project_info.id || '',
          wallet,
        );
      info.investment_info = {
        currency: 'USDT', //FIXME: ko fic cung
        ticket_size: projectInfo.info?.ticket_size,
        token_offered: projectInfo.info?.token_offered,
        total_winner,
        total_owner_winning_tickets,
        tickets_used: 0, //FIXME: ko fic cung
      };
    }
  }
}
