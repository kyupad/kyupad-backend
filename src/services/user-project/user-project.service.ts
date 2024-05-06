import { UserProject } from '@/schemas/user_project.schema';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { AwsSQSService } from '@/services/aws/sqs/sqs.service';
import { ProjectService } from '@/services/project/project.service';
import { ICatnipAssetsSnapshotBody } from '@/services/project/project.input';
import { SeasonService } from '@/services/season/season.service';
import {
  EProjectProgressStatus,
  EProjectStatus,
  EProjectUserAssetType,
  ESnapshotStatus,
} from '@/enums';
import {
  AssetCatnipInfo,
  AssetCatnipInfoChild,
  UserProjectRegistrationDto,
} from '@usecases/project/project.response';
import { Project } from '@schemas/project.schema';
import { NftService } from '@/services/nft/nft.service';

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
    @Inject(NftService)
    private readonly nftService: NftService,
  ) {}

  async create(input: UserProject): Promise<UserProject> {
    const currentTime = new Date().getTime();
    const [project, userProject, season] = await Promise.all([
      this.projectService.findProjectById(input.project_id),
      this.userProjectModel.findOne({
        user_id: input.user_id,
        project_id: input.project_id,
      }),
      this.seasonService.activeSeason(),
    ]);
    if (!project || project.status !== EProjectStatus.ACTIVE) {
      throw new NotFoundException('Project not found');
    }
    if (
      new Date(project.timeline.registration_start_at).getTime() >
        currentTime ||
      new Date(project.timeline.registration_end_at).getTime() < currentTime
    )
      throw new BadRequestException('Registration time invalid');
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
      { timeline: 1, id: 1, info: 1, status: 1 },
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
      const assetCatnipInfo: AssetCatnipInfo[] = [];
      try {
        const stableCoins = (userProject.tokens_with_price || []).filter(
          (tk) => tk.asset_type === EProjectUserAssetType.STABLE_COIN,
        );
        const fungibles = (userProject.tokens_with_price || []).filter(
          (tk) => tk.asset_type === EProjectUserAssetType.FUNGIBLE,
        );
        const nfts = (userProject.nfts_with_price || []).filter(
          (tk) => tk.asset_type === EProjectUserAssetType.NFT,
        );
        const collectionsAddress = (nfts || []).map(
          (nft) => nft.collection_address,
        );
        const collections =
          await this.nftService.getCollectionByListAddress(collectionsAddress);
        const nftAssets: AssetCatnipInfoChild[] = [];
        nfts.forEach((nft) => {
          const matchCollection = collections.find(
            (col) => col.address === nft.collection_address,
          );
          if (matchCollection) {
            nftAssets.push({
              name: matchCollection.name,
              symbol: matchCollection.symbol,
              icon: matchCollection.icon,
              multi_pier: nft.multi_pier,
            });
          }
        });
        assetCatnipInfo.push({
          asset_type: EProjectUserAssetType.NFT,
          assets: nftAssets,
        });
        assetCatnipInfo.push({
          asset_type: EProjectUserAssetType.STABLE_COIN,
          assets: stableCoins.map((info) => {
            return {
              name: info.name,
              symbol: info.symbol,
              icon: info.icon,
              multi_pier: info.multi_pier,
            };
          }),
        });
        assetCatnipInfo.push({
          asset_type: EProjectUserAssetType.FUNGIBLE,
          assets: fungibles.map((info) => {
            return {
              name: info.name,
              symbol: info.symbol,
              icon: info.icon,
              multi_pier: info.multi_pier,
            };
          }),
        });
      } catch (e) {}
      info.catnip_info = {
        catnip_point: Number(
          ((userProject.total_assets || 0) * 0.1).toFixed(4),
        ),
        multi_pier: userProject.multi_pier || 1,
        total_assets: Number((userProject.total_assets || 0).toFixed(3)),
        is_snapshoting:
          userProject.snapshot_status !== ESnapshotStatus.SUCCESSFUL,
        assets_catnip_info: assetCatnipInfo,
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
