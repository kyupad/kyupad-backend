import { Project, Timeline } from '@/schemas/project.schema';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  AssetWithPrice,
  NftAssetWithPrice,
  UserProject,
} from '@/schemas/user_project.schema';
import {
  EOnChainNetwork,
  EProjectParticipationStatus,
  EProjectProgressStatus,
  EProjectStatus,
  EProjectUserAssetType,
  EPUserStatus,
  ETxVerifyStatus,
} from '@/enums';
import {
  AssetCatnipInfo,
  AssetCatnipInfoChild,
  MyInvestedDto,
  MyInvestmentAsset,
  MyInvestmentDetail,
  MyRegisteredDto,
  MyVestingDto,
  ProjectDetailDto,
} from '@usecases/project/project.response';
import { plainToInstance } from 'class-transformer';
import { UsesProjectAssets } from '@/services/user-project/user-project.response';
import { FungibleTokensService } from '../fungible-tokens/fungible-tokens.service';
import { InvestingHistory } from '@schemas/investing_histories.schema';
import { NftService } from '@/services/nft/nft.service';
import { StreamFlowService } from '@/services/streamflow/streamflow.service';
import { ProjectVesting } from '@schemas/project_vesting.schema';
import { UserService } from '@/services/user/user.service';

dayjs.extend(utc);

@Injectable()
export class ProjectService {
  private logger = new Logger(ProjectService.name);

  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(ProjectVesting.name)
    private readonly projectVestingModel: Model<ProjectVesting>,
    @InjectModel(UserProject.name)
    private readonly userProject: Model<UserProject>,
    @InjectModel(InvestingHistory.name)
    private readonly investingHistory: Model<InvestingHistory>,
    @InjectModel(UserProject.name)
    private readonly userProjectModel: Model<UserProject>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    @Inject(FungibleTokensService)
    private readonly fungibleTokensService: FungibleTokensService,
    @Inject(NftService)
    private readonly nftService: NftService,
    @Inject(StreamFlowService)
    private readonly streamFlowService: StreamFlowService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  async create(project: Project): Promise<Project> {
    const result = await this.projectModel.create(project);
    return result;
  }

  async update(id: string, data: Project): Promise<Project | null> {
    const result = await this.projectModel.findByIdAndUpdate(id, data);
    return result;
  }

  async listFurture(params: {
    limit?: number;
    page?: number;
  }): Promise<{ data: Project[]; totalCount: number }> {
    const perPage = Number(params?.limit) || 3;
    const page = params?.page || 1;

    const result = await this.projectModel.aggregate([
      {
        $match: {
          'timeline.registration_start_at': { $lte: dayjs.utc().toDate() },
          'timeline.investment_end_at': { $gte: dayjs.utc().toDate() },
          status: EProjectStatus.ACTIVE,
        },
      },
      {
        $lookup: {
          from: 'fungibletokens',
          localField: 'price.currency',
          foreignField: 'address',
          as: 'tokenDetails',
        },
      },
      {
        $unwind: {
          path: '$tokenDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          'price.currency': '$tokenDetails.symbol',
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [
            { $sort: { 'timeline.registration_start_at': 1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage },
            {
              $project: {
                _id: 0,
                tokenDetails: 0,
              },
            },
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

  async listUpcoming(params: {
    limit?: number;
    page?: number;
  }): Promise<{ data: Project[]; totalCount: number }> {
    const perPage = Number(params?.limit) || 3;
    const page = params?.page || 1;

    const result = await this.projectModel.aggregate([
      {
        $match: {
          'timeline.registration_start_at': { $gt: dayjs.utc().toDate() },
          status: EProjectStatus.ACTIVE,
        },
      },
      {
        $lookup: {
          from: 'fungibletokens',
          localField: 'price.currency',
          foreignField: 'address',
          as: 'tokenDetails',
        },
      },
      {
        $unwind: {
          path: '$tokenDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          'price.currency': '$tokenDetails.symbol',
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [
            { $sort: { 'timeline.registration_start_at': 1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage },
            {
              $project: {
                _id: 0,
                tokenDetails: 0,
              },
            },
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
        $lookup: {
          from: 'fungibletokens',
          localField: 'price.currency',
          foreignField: 'address',
          as: 'tokenDetails',
        },
      },
      {
        $lookup: {
          from: 'userprojects',
          let: { pId: { $toString: '$_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$project_oid', '$$pId'] } } }],
          as: 'user_projects',
        },
      },
      {
        $unwind: {
          path: '$tokenDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $set: {
          'price.currency': '$tokenDetails.symbol',
          participants: {
            $size: '$user_projects',
          },
          ath_roi: 'TBA',
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [
            { $sort: { 'timeline.investment_end_at': -1 } },
            { $skip: perPage * page - perPage },
            { $limit: perPage },
            {
              $project: {
                _id: 0,
                tokenDetails: 0,
                user_projects: 0,
              },
            },
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

  async findProjectById(id: string): Promise<Project> {
    const project = await this.projectModel.findOne({
      id,
    });
    if (!project || project.status !== EProjectStatus.ACTIVE) {
      throw new NotFoundException('Project not found');
    }
    return JSON.parse(JSON.stringify(project)) as Project;
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

    let tokens = null;
    if (
      projectInfo?.price?.currency &&
      projectInfo?.price?.currency?.toLocaleLowerCase() !== 'sol'
    ) {
      tokens = await this.fungibleTokensService.findTokens({
        address: projectInfo?.price?.currency,
        is_stable: true,
      });
    }

    projectDetail.project.price = {
      ...projectInfo.price,
      currency: tokens ? tokens?.[0]?.symbol : projectInfo?.price?.currency,
      ...(tokens ? { currency_address: tokens?.[0]?.address } : {}),
    };
    if (wallet) {
      const [myUserProject, aggregateUserRegisterProjectResult, user] =
        await Promise.all([
          this.userProjectModel.findOne({
            project_id: String(project.id),
            user_id: wallet,
          }),
          this.aggregateUsersProjectAssets(String(project?.id)),
          this.userService.findUserByWallet(
            wallet,
            EOnChainNetwork.SOLANA,
            false,
          ),
        ]);
      if (myUserProject) projectDetail.is_applied = true;
      if (aggregateUserRegisterProjectResult)
        projectDetail.users_assets = aggregateUserRegisterProjectResult;
      if (user?.email) projectDetail.notification_email = user?.email;
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

  async myInvested(wallet: string): Promise<MyInvestmentDetail> {
    const [usersProject, userInvestedPma] = await Promise.all([
      this.userProjectModel.find({
        user_id: wallet,
      }),
      this.investingHistory.aggregate([
        {
          $match: {
            wallet,
            verify_status: { $ne: ETxVerifyStatus.NOT_VERIFY },
          },
        },
        {
          $group: {
            _id: '$project_id',
            invested: {
              $sum: '$total',
            },
            updated_at: {
              $max: '$updatedAt',
            },
          },
        },
        {
          $lookup: {
            from: 'projects',
            let: { pId: { $toObjectId: '$_id' } },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pId'] } } }],
            as: 'project',
          },
        },
        {
          $sort: {
            updated_at: -1,
          },
        },
      ]),
    ]);
    const userInvested = userInvestedPma as {
      _id: string;
      invested: number;
      project: Project[];
      updated_at: string;
    }[];
    const currentTime = new Date().getTime();
    const myAssets = await this.projectUserAssets(usersProject);
    return {
      my_invested: userInvested
        .filter((uv) => uv.project && uv.project.length > 0)
        .map((uv) => {
          return plainToInstance(MyInvestedDto, {
            project_id: uv.project[0].id,
            project_name: uv.project[0].name,
            project_slug: uv.project[0].slug,
            project_logo: uv.project[0].logo,
            token: uv.project[0].token_info?.symbol,
            invested_amount:
              (uv.project[0].info?.ticket_size * uv.invested) /
              uv.project[0].price?.amount,
            claim_available:
              uv.project[0].p_user_status ===
                EPUserStatus.PROJECT_VESTING_SETTING_SUCCESSFUL &&
              currentTime >=
                new Date(uv.project[0].timeline.claim_start_at).getTime(),
          });
        }),
      my_assets: myAssets,
    };
  }

  async projectUserAssets(
    userProjects: UserProject[],
  ): Promise<MyInvestmentAsset | undefined> {
    try {
      let totalAssets = 0;
      let stableCoinsAll: AssetWithPrice[] = [];
      let fungiblesAll: AssetWithPrice[] = [];
      let nftsAll: NftAssetWithPrice[] = [];
      const assetCatnipInfo: AssetCatnipInfo[] = [];
      userProjects.forEach((userProject) => {
        totalAssets = totalAssets + (userProject.total_assets || 0);
        const stableCoins = (userProject.tokens_with_price || []).filter(
          (tk) => tk.asset_type === EProjectUserAssetType.STABLE_COIN,
        );
        stableCoinsAll = [...stableCoinsAll, ...stableCoins];
        const fungibles = (userProject.tokens_with_price || []).filter(
          (tk) => tk.asset_type === EProjectUserAssetType.FUNGIBLE,
        );
        fungiblesAll = [...fungiblesAll, ...fungibles];
        const nfts = (userProject.nfts_with_price || []).filter(
          (tk) => tk.asset_type === EProjectUserAssetType.NFT,
        );
        nftsAll = [...nftsAll, ...nfts];
      });
      const collectionsAddress = (nftsAll || []).map(
        (nft) => nft.collection_address,
      );
      const collections = await this.nftService.getCollectionByListAddress(
        Array.from(new Set(collectionsAddress)),
      );
      const nftAssets: AssetCatnipInfoChild[] = [];
      nftsAll.forEach((nft) => {
        const matchCollection = collections.find(
          (col) => col.address === nft.collection_address,
        );
        if (matchCollection) {
          const isExists = nftAssets.find(
            (na) => na.address === matchCollection.address,
          );
          if (!isExists)
            nftAssets.push({
              address: matchCollection.address,
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
      const stableCoinAssets: AssetCatnipInfoChild[] = [];
      stableCoinsAll.forEach((sbc) => {
        const isExists = stableCoinAssets.find(
          (info) => info.symbol === sbc.symbol,
        );
        if (!isExists)
          stableCoinAssets.push({
            name: sbc.name,
            symbol: sbc.symbol,
            icon: sbc.icon,
            multi_pier: sbc.multi_pier,
          });
      });
      assetCatnipInfo.push({
        asset_type: EProjectUserAssetType.STABLE_COIN,
        assets: stableCoinAssets,
      });
      const fungiblesAssets: AssetCatnipInfoChild[] = [];
      fungiblesAll.forEach((fa) => {
        const isExists = fungiblesAssets.find(
          (info) => info.symbol === fa.symbol,
        );
        if (!isExists)
          fungiblesAssets.push({
            name: fa.name,
            symbol: fa.symbol,
            icon: fa.icon,
            multi_pier: fa.multi_pier,
          });
      });
      assetCatnipInfo.push({
        asset_type: EProjectUserAssetType.FUNGIBLE,
        assets: fungiblesAssets,
      });
      return {
        total_assets: totalAssets,
        assets_info: assetCatnipInfo,
      };
    } catch (e) {
      this.logger.error(
        `Cannot get project assets of user [${userProjects[0].user_id}] ${e.stack}`,
      );
    }
  }

  async myParticipation(wallet: string): Promise<MyInvestmentDetail> {
    const [usersProject, userRegisteredPma] = await Promise.all([
      this.userProjectModel.find({
        user_id: wallet,
      }),
      this.userProject.aggregate([
        {
          $match: {
            user_id: wallet,
          },
        },
        {
          $lookup: {
            from: 'projects',
            let: { pId: { $toObjectId: '$project_oid' } },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pId'] } } }],
            as: 'project',
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $project: {
            project: 1,
            project_oid: 1,
            total_ticket: 1,
          },
        },
      ]),
    ]);
    const userRegistered = userRegisteredPma as {
      _id: string;
      project: Project[];
      project_oid: string;
      total_ticket: number;
    }[];
    const currentTime = new Date().getTime();
    const myAssets = await this.projectUserAssets(usersProject);
    const myRegistered: MyRegisteredDto[] = [];
    userRegistered.forEach((ur) => {
      if (ur.project && ur.project.length > 0) {
        let status = EProjectParticipationStatus.ONGOING;
        if (
          currentTime >
          new Date(ur.project[0].timeline.investment_end_at).getTime()
        )
          status = EProjectParticipationStatus.ENDED;
        if ((ur.total_ticket || 0) > 0)
          status = EProjectParticipationStatus.WON;
        myRegistered.push(
          plainToInstance(MyRegisteredDto, {
            project_id: String(ur.project[0].id),
            project_slug: ur.project[0].slug,
            project_name: ur.project[0].name,
            token: ur.project[0].token_info?.symbol,
            project_participation_status: status,
            project_logo: ur.project[0].logo,
          }),
        );
      }
    });
    return {
      my_assets: myAssets,
      my_registered: myRegistered,
    };
  }

  async investedOfUser(wallet: string, project_Id: string): Promise<number> {
    const invested = await this.investingHistory.find({
      wallet,
      project_id: project_Id,
      pda_account: {
        $ne: null,
      },
    });
    if (!invested || invested.length === 0)
      throw new BadRequestException('Investing info not found');
    return invested[0].on_chain_total || 0;
  }

  async myVesting(wallet: string, projectSlug: string): Promise<MyVestingDto> {
    const projectNative = await this.findProjectBySlug(projectSlug);
    const project = JSON.parse(JSON.stringify(projectNative)) as Project;
    const [vesting, invested, paymentToken] = await Promise.all([
      this.projectVestingModel.findOne({
        project_id: String(project._id),
      }),
      this.investedOfUser(wallet, String(project._id)),
      this.fungibleTokensService.getTokenByAddress(project.price.currency),
    ]);
    if (!vesting || !vesting.token)
      throw new NotFoundException('Vesting info not found');
    const vestingStreams = await this.streamFlowService.incomingStreamsOfOwner(
      String(project._id),
      wallet,
      vesting.token,
    );
    const tgeInfo = vesting.schedules.find((ve) => ve.vesting_type === 'cliff');
    const investedTotal = project.info?.ticket_size * invested;
    const cliffStream = vestingStreams.find((stream) => stream.is_cliff);
    const linearStream = vestingStreams.find((stream) => !stream.is_cliff);
    const response: MyVestingDto = {
      project_vesting: {
        _id: String(project._id),
        name: project.name,
        tge_amount: tgeInfo ? tgeInfo.amount_per_period?.amount : 0,
        tge_type: tgeInfo ? tgeInfo.amount_per_period?.amount_type : undefined,
        invested_total: investedTotal,
        invested_currency: paymentToken ? paymentToken.symbol : 'UNKNOWN',
        vesting_total: investedTotal / project.price?.amount,
        vesting_token: vesting.token,
        vesting_token_symbol: project.token_info.symbol,
        vesting_type: project.token_info.vesting_type,
      },
    };
    if (cliffStream && (cliffStream?.available_amount || 0) > 0) {
      response.vesting_pool = {
        is_active:
          (cliffStream.available_amount || 0) > 0 &&
          project.p_user_status ===
            EPUserStatus.PROJECT_VESTING_SETTING_SUCCESSFUL &&
          new Date().getTime() >=
            new Date(project.timeline.claim_start_at).getTime(),
        is_tge: true,
        stream_id: cliffStream.stream_id,
        project__id: String(project._id),
        start_at: cliffStream.start_at,
        end_at: cliffStream.end_at,
        sender: cliffStream.sender,
        recipient: cliffStream.recipient,
        total_amount: cliffStream.total_amount,
        released_amount: cliffStream.released_amount,
        available_amount: cliffStream.available_amount,
        withdrawn_amount: cliffStream.withdrawn_amount,
        last_withdrawn_at: cliffStream.last_withdrawn_at,
        token: cliffStream.token,
        vesting_schedule: (() => {
          return [
            {
              vesting_time: cliffStream.start_at,
              vesting_total: cliffStream.total_amount,
              vesting_token_symbol: project.token_info.symbol,
            },
          ];
        })(),
      };
    } else if (linearStream) {
      response.vesting_pool = {
        is_active:
          (linearStream.available_amount || 0) > 0 &&
          project.p_user_status ===
            EPUserStatus.PROJECT_VESTING_SETTING_SUCCESSFUL &&
          new Date().getTime() >=
            new Date(project.timeline.claim_start_at).getTime(),
        is_tge: false,
        stream_id: linearStream.stream_id,
        project__id: String(project._id),
        start_at:
          linearStream.cliff_amount && linearStream.cliff_amount > 0
            ? new Date(linearStream.start_at).toISOString()
            : new Date(
                new Date(linearStream.start_at).getTime() +
                  linearStream.period * 1000,
              ).toISOString(),
        end_at: linearStream.end_at,
        sender: linearStream.sender,
        recipient: linearStream.recipient,
        total_amount: linearStream.total_amount,
        released_amount: linearStream.released_amount,
        available_amount: linearStream.available_amount,
        withdrawn_amount: linearStream.withdrawn_amount,
        last_withdrawn_at: linearStream.last_withdrawn_at,
        token: linearStream.token,
        vesting_schedule: (() => {
          const arrLength =
            ((linearStream?.total_amount || 0) - linearStream.cliff_amount) /
            (linearStream?.amount_per_period || 1);
          const data = Array(arrLength || 0)
            .fill(0)
            .map((_, idx) => {
              const startTime = new Date(linearStream?.start_at || 0).getTime();
              const vestingTime =
                startTime + (idx + 1) * (linearStream?.period || 1) * 1000;
              return {
                vesting_time: new Date(vestingTime).toISOString(),
                vesting_total: linearStream?.amount_per_period || 0,
                vesting_token_symbol: project.token_info.symbol,
                is_cliff: false,
              };
            });
          if (linearStream.cliff_amount && linearStream.cliff_amount > 0)
            data.unshift({
              vesting_time: new Date(linearStream.cliff_at).toISOString(),
              vesting_total: linearStream?.cliff_amount || 0,
              vesting_token_symbol: project.token_info.symbol,
              is_cliff: true,
            });
          return data;
        })(),
      };
    }
    return response;
  }
}
