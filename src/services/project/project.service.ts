import { Project, Timeline } from '@/schemas/project.schema';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  EProjectParticipationStatus,
  EProjectProgressStatus,
  EProjectStatus,
  EProjectUserAssetType,
  ETxVerifyStatus,
} from '@/enums';
import {
  AssetCatnipInfo,
  AssetCatnipInfoChild,
  MyInvestmentAsset,
  MyInvestmentDetail,
  MyRegisteredDto,
  ProjectDetailDto,
} from '@usecases/project/project.response';
import { plainToInstance } from 'class-transformer';
import { UsesProjectAssets } from '@/services/user-project/user-project.response';
import { FungibleTokensService } from '../fungible-tokens/fungible-tokens.service';
import { InvestingHistory } from '@schemas/investing_histories.schema';
import { NftService } from '@/services/nft/nft.service';

dayjs.extend(utc);

@Injectable()
export class ProjectService {
  private logger = new Logger(ProjectService.name);

  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
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
            { $sort: { 'timeline.investment_end_at': -1 } },
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

    let tokens = null;
    if (
      projectInfo?.price?.currency &&
      projectInfo?.price?.currency?.toLocaleLowerCase() !== 'sol'
    ) {
      tokens = await this.fungibleTokensService.findTokens({
        address: projectInfo?.price?.currency,
        // is_stable: true, FIXME: is_stable MUST be true
      });
    }

    projectDetail.project.price = {
      ...projectInfo.price,
      currency: tokens ? tokens?.[0]?.symbol : projectInfo?.price?.currency,
      ...(tokens ? { currency_address: tokens?.[0]?.address } : {}),
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
          return {
            project_id: uv.project[0].id,
            project_name: uv.project[0].name,
            project_slug: uv.project[0].slug,
            token: uv.project[0].token_info?.symbol,
            invested_amount:
              (uv.project[0].info?.ticket_size * uv.invested) /
              uv.project[0].price?.amount,
            claim_available:
              currentTime >=
              new Date(uv.project[0].timeline.claim_start_at).getTime(),
          };
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
        let status = EProjectParticipationStatus.OUTGOING;
        if (
          currentTime >
          new Date(ur.project[0].timeline.investment_end_at).getTime()
        )
          status = EProjectParticipationStatus.ENDED;
        if ((ur.total_ticket || 0) > 0)
          status = EProjectParticipationStatus.WON;
        myRegistered.push({
          project_id: String(ur.project[0].id),
          project_slug: ur.project[0].slug,
          project_name: ur.project[0].name,
          token: ur.project[0].token_info?.symbol,
          project_participation_status: status,
        });
      }
    });
    return {
      my_assets: myAssets,
      my_registered: myRegistered,
    };
  }
}
