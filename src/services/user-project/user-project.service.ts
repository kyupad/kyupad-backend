import { UserProject } from '@/schemas/user_project.schema';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { AnyBulkWriteOperation, Model } from 'mongoose';
import { AwsSQSService } from '@/services/aws/sqs/sqs.service';
import { ProjectService } from '@/services/project/project.service';
import { ICatnipAssetsSnapshotBody } from '@/services/project/project.input';
import { SeasonService } from '@/services/season/season.service';
import {
  EProjectProgressStatus,
  EProjectStatus,
  EProjectUserAssetType,
  EPUserStatus,
  ESnapshotStatus,
  ETxVerifyStatus,
} from '@/enums';
import {
  AssetCatnipInfo,
  AssetCatnipInfoChild,
  UserProjectRegistrationDto,
} from '@usecases/project/project.response';
import { Project } from '@schemas/project.schema';
import { NftService } from '@/services/nft/nft.service';
import { ProjectInvestingInfoService } from '../project-investing-info/project-investing-info.service';
import { FungibleTokensService } from '../fungible-tokens/fungible-tokens.service';
import { encrypt, getMerkleProof } from '@/helpers';
import { InvestingHistory } from '@schemas/investing_histories.schema';
import { SyncInvestingBySignatureInput } from '@usecases/project/project.input';
import { HeliusIDOTxRawHook } from '@/services/helius/helius.response';

interface IGlobalCacheHolder {
  last_update_time?: number;
  whitelist?: string[];
}

@Injectable()
export class UserProjectService {
  private logger = new Logger(ProjectService.name);

  constructor(
    @InjectModel(UserProject.name)
    private readonly userProjectModel: Model<UserProject>,
    @InjectModel(InvestingHistory.name)
    private readonly investingHistoryModel: Model<InvestingHistory>,
    @Inject(ProjectService)
    private readonly projectService: ProjectService,
    @Inject(AwsSQSService)
    private readonly awsSQSService: AwsSQSService,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @Inject(SeasonService)
    private readonly seasonService: SeasonService,
    @Inject(NftService)
    private readonly nftService: NftService,
    @Inject(ProjectInvestingInfoService)
    private readonly projectInvestingInfo: ProjectInvestingInfoService,
    @Inject(FungibleTokensService)
    private readonly fungibleTokensService: FungibleTokensService,
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
      { timeline: 1, id: 1, info: 1, status: 1, price: 1, p_user_status: 1 },
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

    if (info.progress_status === EProjectProgressStatus.INVESTING)
      await this.userProjectInvestingInfo(info, projectInfo, wallet);
  }

  async userProjectInvestingInfo(
    info: UserProjectRegistrationDto,
    projectInfo: Project,
    wallet: string,
  ): Promise<void> {
    const aggregateUsersProjectTicket = this.aggregateUsersProjectTicket(
      info.project_info.id || '',
      String(info.project_info._id || ''),
      wallet,
    );

    const projectInvestingInfo = this.projectInvestingInfo.findByProjectId({
      project_id: String(info.project_info._id || ''),
    });

    let tokens = null;
    if (
      projectInfo?.price?.currency &&
      projectInfo?.price?.currency?.toLocaleLowerCase() !== 'sol'
    ) {
      tokens = await this.fungibleTokensService.findTokens({
        address: projectInfo?.price?.currency,
        is_stable: true,
      });
      if (!tokens || tokens.length === 0)
        throw new BadRequestException('Currency not found');
    }

    const result = await Promise.all([
      aggregateUsersProjectTicket,
      projectInvestingInfo,
    ]);

    const [userProject, investingInfo] = result;
    const { total_winner, total_owner_winning_tickets, used_ticket } =
      userProject;

    info.investment_info = {
      currency: tokens ? tokens?.[0]?.symbol : projectInfo?.price?.currency,
      ...(tokens ? { currency_address: tokens?.[0].address } : {}),
      ticket_size: projectInfo.info?.ticket_size,
      token_offered: projectInfo.info?.token_offered,
      total_winner,
      total_owner_winning_tickets,
      tickets_used: used_ticket,
      destination_wallet: investingInfo?.destination_wallet || '',
    };
    if (
      projectInfo.p_user_status ===
      EPUserStatus.PROJECT_INVESTMENT_SETTING_SUCCESSFUL
    ) {
      if (
        info.investment_info?.total_owner_winning_tickets &&
        (info.investment_info?.total_owner_winning_tickets || 0) >
          info.investment_info?.tickets_used
      ) {
        let whitelist: string[];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const whitelistCache = global[
          `project-hd-${String(projectInfo._id)}`
        ] as IGlobalCacheHolder;
        if (
          whitelistCache &&
          whitelistCache?.last_update_time &&
          whitelistCache.whitelist &&
          whitelistCache?.whitelist?.length > 0
        ) {
          whitelist = whitelistCache?.whitelist || [];
        } else {
          whitelist = investingInfo?.whitelist || [];
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          global[`project-hd-${String(projectInfo._id)}`] = {
            last_update_time: new Date().getTime(),
            whitelist,
          } as IGlobalCacheHolder;
        }
        if (
          (whitelist || []).includes(
            `${wallet}_${info.investment_info?.total_owner_winning_tickets || 0}`,
          )
        )
          info.investment_info = {
            ...info.investment_info,
            is_active: true,
          };
        if (
          info.investment_info?.is_active &&
          !info.investment_info?.is_invested
        ) {
          const merkleRoof = getMerkleProof(
            whitelist || [],
            `${wallet}_${info.investment_info?.total_owner_winning_tickets || 0}` ||
              '',
          );
          info.investment_info.merkle_proof = encrypt(
            JSON.stringify(merkleRoof),
            process.env.CRYPTO_ENCRYPT_TOKEN as string,
          );
        }
      } else {
        info.investment_info = {
          ...info.investment_info,
          is_invested: true,
        };
      }
    }
  }

  async generateInvestOffChainId(
    wallet: string,
    investTotal: number,
    projectId: string,
  ): Promise<string> {
    const result = await this.investingHistoryModel.create({
      wallet,
      total: investTotal,
      project_id: projectId,
      verify_at: new Date(),
    });
    if (!result || !result._id)
      throw new InternalServerErrorException(
        'Generate investing info has error',
      );
    return result._id;
  }

  async syncInvestingBySignature(
    wallet: string,
    input: SyncInvestingBySignatureInput,
  ): Promise<void> {
    try {
      await this.investingHistoryModel.create({
        wallet,
        total: input.total || 1,
        project_id: input.project__id,
        verify_at: new Date(),
        signature: input.signature,
      });
    } catch (e) {}
  }

  async aggregateUsersProjectTicket(
    projectId: string,
    project_Id: string,
    wallet: string,
  ): Promise<{
    total_owner_winning_tickets: number;
    total_winner: number;
    used_ticket: number;
  }> {
    const [myUserProjects, totalTicketUserProject] = await Promise.all([
      this.userProjectModel.aggregate([
        {
          $match: {
            project_id: projectId,
            user_id: wallet,
          },
        },
        {
          $lookup: {
            from: 'investinghistories',
            let: { uId: '$user_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ['$project_id', project_Id],
                      },
                      {
                        $eq: ['$wallet', '$$uId'],
                      },
                      {
                        $ne: ['$verify_status', ETxVerifyStatus.NOT_VERIFY],
                      },
                    ],
                  },
                },
              },
            ],
            as: 'investing_history',
          },
        },
        {
          $project: {
            _id: 1,
            total_ticket: 1,
            project_id: 1,
            user_id: 1,
            investing_history: 1,
          },
        },
      ]),
      this.userProjectModel.countDocuments({
        project_id: projectId,
        total_ticket: {
          $gt: 0,
        },
      }),
    ]);
    if (!myUserProjects || myUserProjects.length === 0)
      throw new NotFoundException('User project not found');
    const myUserProject = myUserProjects[0] as {
      _id: string;
      total_ticket: number;
      project_id: string;
      user_id: string;
      investing_history: {
        _id: string;
        project_id: string;
        total: number;
      }[];
    };
    const usedTickets = (myUserProject?.investing_history || []).reduce(
      (n, { total }) => n + total,
      0,
    );
    return {
      total_owner_winning_tickets: myUserProject
        ? myUserProject.total_ticket || 0
        : 0,
      total_winner: totalTicketUserProject | 0,
      used_ticket: usedTickets || 0,
    };
  }

  async syncInvestingFromHook(
    transactions: HeliusIDOTxRawHook[],
    authorization: string,
  ): Promise<void> {
    if (authorization !== process.env.HELIUS_WEBHOOK_TOKEN) return;
    const bulkData: AnyBulkWriteOperation<InvestingHistory>[] = [];
    transactions.forEach((transaction) => {
      let signature = 'UNKNOWN';
      try {
        const logs = transaction.meta?.logMessages;
        if (logs && logs.length > 6) {
          const investInfo = logs[6].replace('Program log: ', '');
          const investInfoArr = investInfo.split('_');
          if (investInfoArr.length > 1) {
            const projectId = investInfoArr[0];
            const total = investInfoArr[1];
            const owner = transaction.transaction?.message?.accountKeys[0];
            signature = transaction.transaction?.signatures[0];
            bulkData.push({
              updateOne: {
                filter: { signature },
                update: {
                  project_id: projectId,
                  wallet: owner,
                  total,
                  verify_status: ETxVerifyStatus.TX_WEB_HOOK_VERIFY,
                  verify_at: new Date(),
                },
                upsert: true,
              },
            });
          }
        }
      } catch (e) {
        this.logger.error(
          `Cannot sync [IDO] of signature [${signature}] ${e.stack}`,
        );
      }
    });
    await this.investingHistoryModel.bulkWrite(bulkData);
  }
}
