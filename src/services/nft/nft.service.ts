import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SeasonService } from '@/services/season/season.service';
import { NftWhiteList } from '@schemas/nft_whitelists.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, {
  AnyBulkWriteOperation,
  FilterQuery,
  Model,
  PipelineStage,
  UpdateQuery,
} from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { MintingPoolRoundDto, PoolDto } from '@usecases/nft/nft.response';
import { encrypt, getMerkleProof } from '@/helpers';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../aws/s3/s3.service';
import {
  GenerateCnftMetaDataBody,
  GenerateCnftMetaDataPrivateBody,
  GenerateCnftMetadataResult,
} from '@/usecases/nft/nft.type';
import { KyupadNft } from '@schemas/kyupad_nft.schema';
import { HeliusEventHook } from '@/services/helius/helius.response';
import { HeliusService } from '@/services/helius/helius.service';
import { AppsyncService } from '@/services/aws/appsync/appsync.service';
import { AppsyncNftActionInput } from '@/services/nft/nft.input';
import { NFT_ACTION_SCHEMA } from '@/services/nft/Nft.appsyncschema';
import { EUserAction } from '@/enums';
import { NftCollection } from '@schemas/nft_collections.schema';
import { RefCode } from '@schemas/ref_code.schema';
import { InvestingHistory } from '@schemas/investing_histories.schema';

interface IGlobalCacheHolder {
  last_update_time?: number;
  holders?: string[];
}

@Injectable()
export class NftService {
  private logger = new Logger(NftService.name);
  private readonly AWS_S3_BUCKET_URL: string;
  private readonly WEB_URL: string;

  constructor(
    @InjectModel(NftWhiteList.name)
    private readonly nftWhiteListModel: Model<NftWhiteList>,
    @InjectModel(KyupadNft.name)
    private readonly kyupadNftModel: Model<KyupadNft>,
    @InjectModel(NftCollection.name)
    private readonly nftCollection: Model<NftCollection>,
    @InjectModel(RefCode.name)
    private readonly refCodeModel: Model<RefCode>,
    @Inject(SeasonService)
    private readonly seasonService: SeasonService,
    @Inject(HeliusService)
    private readonly heliusService: HeliusService,
    @Inject(AppsyncService)
    private readonly appsyncService: AppsyncService,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {
    this.AWS_S3_BUCKET_URL = this.configService.get('AWS_S3_BUCKET_URL')!;
    this.WEB_URL = this.configService.get('WEB_URL')!;
  }

  async mintingPool(
    poolId?: string,
    wallet?: string,
  ): Promise<MintingPoolRoundDto> {
    let poolMinted = 0;
    const season = await this.seasonService.activeSeason(false);
    const arrFn: (
      | Promise<NftWhiteList[]>
      | Promise<KyupadNft[]>
      | Promise<number>
    )[] = [
      this.listPool({
        season_id: season._id,
        is_active_pool: true,
      }),
      this.countNftByWalletOfSeason(season._id, wallet),
    ];
    if (poolId) {
      arrFn.push(this.countMintedTotal(String(season._id), poolId));
    }
    const arrResult = await Promise.all(arrFn);
    let pools = arrResult[0] as NftWhiteList[];
    const nftHolderOfSeason = arrResult[1] as KyupadNft[];
    if (!pools || pools.length === 0)
      throw new BadRequestException('Pools of season not found');
    if (poolId) poolMinted = arrResult[2] as number;
    else {
      poolMinted = await this.countMintedTotal(
        String(season._id),
        String(pools[0]._id),
      );
    }
    const response = new MintingPoolRoundDto();
    response.collection_address = season.nft_collection?.address;
    response.season_id = String(season._id);
    response.contract_address = season.nft_contract;
    response.merkle_tree = season.merkle_tree;
    response.lookup_table_address = season.lookup_table_address;
    response.seller_fee_basis_points = season.seller_fee_basis_points || 400;
    response.creators = season.creators;
    response.priority_fees = season.priority_fees || 100000;
    const activePools: PoolDto[] = [];
    pools = pools.filter((round) => {
      if (
        round.pool_private_whitelist &&
        round.pool_private_whitelist?.length > 0
      ) {
        return round.pool_private_whitelist.includes(wallet || '');
      }
      return true;
    });
    await Promise.all(
      pools.map(async (pool, idx) => {
        if (pool.collection && pool.collection.length > 0) {
          const collection = pool.collection[0];
          const mintingPool: PoolDto = {
            pool_id: String(pool._id || 'NONE'),
            pool_name: collection.name,
            pool_symbol: season.nft_collection?.symbol || 'KYUPAD',
            start_time: pool.start_time,
            end_time: pool.end_time,
            mint_fee: pool.mint_fee,
            minted_total: poolMinted,
            pool_supply: pool.pool_supply,
            total_mint_per_wallet: pool.total_mint_per_wallet,
            pool_image: collection.icon,
            destination_wallet: pool.destination_wallet,
            order: pool.order,
          };
          if (
            (idx === 0 && !poolId) ||
            (poolId &&
              (idx !== 0 ||
                new mongoose.Types.ObjectId(poolId).equals(
                  new mongoose.Types.ObjectId(pools[0]._id),
                )) &&
              new mongoose.Types.ObjectId(poolId).equals(
                new mongoose.Types.ObjectId(pool._id),
              ))
          ) {
            const nftHolderOfPool = nftHolderOfSeason.filter((info) => {
              return String(info.pool_id) === String(pool._id);
            });
            if (wallet) {
              let holders = [];
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              const holderCache = global[
                `pool-hd-${String(pool._id)}`
              ] as IGlobalCacheHolder;
              if (
                holderCache &&
                holderCache?.last_update_time &&
                holderCache.holders &&
                holderCache?.holders?.length > 0 &&
                new Date(
                  pool.modify_holder_time || '2001-01-01T00:01:00.000Z',
                ).getTime() < holderCache?.last_update_time
              ) {
                holders = holderCache?.holders || [];
              } else {
                holders = await this.getHoldersOfPool(pool._id);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                global[`pool-hd-${String(pool._id)}`] = {
                  last_update_time: new Date().getTime(),
                  holders,
                } as IGlobalCacheHolder;
              }
              pool.holders = holders;
              mintingPool.user_pool_minted_total = nftHolderOfPool.length;
              mintingPool.is_minted =
                nftHolderOfPool.length >= (pool.total_mint_per_wallet || 1);
            }
            mintingPool.is_active =
              mintingPool.minted_total <= mintingPool.pool_supply &&
              nftHolderOfPool.length < (pool.total_mint_per_wallet || 1) &&
              nftHolderOfSeason.length < (season.nft_per_user_limit || 2) &&
              mintingPool.minted_total < mintingPool.pool_supply &&
              pool.holders?.includes(wallet || 'NONE');
            response.community_round = {
              current_pool: mintingPool,
            };
            activePools.push(
              plainToInstance(PoolDto, mintingPool, {
                excludeExtraneousValues: true,
                groups: ['list'],
              }),
            );
            if (
              mintingPool.is_active &&
              pool.holders &&
              pool.holders?.length > 0
            ) {
              const merkleRoof = getMerkleProof(
                pool.holders || [],
                wallet || '',
              );
              mintingPool.merkle_proof = encrypt(
                JSON.stringify(merkleRoof),
                process.env.CRYPTO_ENCRYPT_TOKEN as string,
              );
            }
          } else {
            activePools.push(
              plainToInstance(PoolDto, mintingPool, {
                excludeExtraneousValues: true,
                groups: ['list'],
              }),
            );
          }
        }
      }),
    );
    activePools.sort((a, b) => (a.order || 0) - (b.order || 0));
    response.community_round = {
      ...response.community_round,
      active_pools: activePools,
    };
    return response;
  }

  async listPool(
    filter: FilterQuery<NftWhiteList>,
    withoutHolder = true,
  ): Promise<NftWhiteList[]> {
    const aggregateInput: PipelineStage[] = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'nftcollections',
          localField: 'collection_address',
          foreignField: 'address',
          as: 'collection',
        },
      },
      {
        $project: {
          holders: 0,
          backup_holders: 0,
        },
      },
      {
        $sort: { order: 1 },
      },
    ];
    if (withoutHolder)
      aggregateInput.push({
        $project: {
          holders: 0,
          backup_holders: 0,
        },
      });
    const pools: NftWhiteList[] =
      await this.nftWhiteListModel.aggregate(aggregateInput);
    return pools.map((pool) => {
      pool.collection = [
        {
          _id: `community-${pool.order}`,
          address: `community-${pool.order}`,
          name: pool.community_name || `community-${pool.order}`,
          symbol: `COMMUNITY-${pool.order}`,
          icon:
            pool.community_image ||
            's3://public/icons/nfts/community.png'.replace(
              's3://',
              `${process.env.AWS_S3_BUCKET_URL}/`,
            ),
        },
      ];
      return pool;
    });
  }

  async generateCNftMetaData(
    {
      id,
      ref_code,
    }: GenerateCnftMetaDataPrivateBody | GenerateCnftMetaDataBody,
    wallet: string,
  ): Promise<GenerateCnftMetadataResult> {
    const season = await this.seasonService.activeSeason();
    const session = await this.connection.startSession();
    const collection = season.nft_collection;
    const result: GenerateCnftMetadataResult = await session.withTransaction(
      async () => {
        const nftInput: KyupadNft = {
          pool_id: id,
          nft_name: season.season_name,
          season_id: String(season._id),
          request_wallet: wallet,
        };
        if (ref_code) {
          nftInput.ref_code = ref_code;
        }
        const results = await this.kyupadNftModel.create([nftInput], {
          session,
        });
        const nft = results[0];
        if (!nft || !nft._id)
          throw new BadRequestException('Can not generate nft uri');
        const metadata = {
          name: collection?.name || 'Kyupad',
          description:
            'Kyupad NFT Pass Gen 1 is a collection of space-themed cat NFT that offers Holders exclusive perks on Kyupad Launchpad & multiple benefits.',
          symbol: collection?.symbol || 'KYU',
          image: this.AWS_S3_BUCKET_URL + '/public/images/nft/kyupad.jpg',
          external_url: this.WEB_URL,
          seller_fee_basis_points: season.seller_fee_basis_points || 900,
          attributes: [],
          properties: {
            files: [
              {
                id: 'portrait',
                uri: this.AWS_S3_BUCKET_URL + '/public/images/nft/kyupad.jpg',
                type: 'image/jpeg',
              },
            ],
            collection: {
              name: collection?.name || 'Kyupad',
              family: collection?.symbol || 'KYU',
            },
            creators: season.creators || [],
          },
        };
        const key = `public/metadata/cnft/${nftInput.season_id}/${id}/${String(nft._id)}.json`;
        const url = await this.s3Service.uploadCnftMetadata({
          data: JSON.stringify(metadata),
          key,
        });
        return {
          url,
          name: metadata.name,
          symbol: metadata.symbol,
          id: String(nft._id),
        };
      },
    );
    await session.endSession();
    return result;
  }

  async syncNftFromWebHook(
    transactions: HeliusEventHook[],
    authorization: string,
  ): Promise<void> {
    if (authorization !== process.env.HELIUS_WEBHOOK_TOKEN) return;
    await Promise.all(
      transactions.map(async (transaction) => {
        let signature = 'UNKNOWN';
        try {
          if (transaction.signature) signature = transaction.signature;
          if (transaction?.type === 'COMPRESSED_NFT_MINT') {
            this.logger.log(
              `Sync [COMPRESSED_NFT_MINT] of signature [${transaction.signature}]...`,
            );
            if (transaction?.transactionError) {
              this.logger.error(
                `Cannot sync [COMPRESSED_NFT_MINT] of signature [${transaction.signature}]`,
              );
            } else {
              await this.updateKyuPadNftByTx(transaction);
            }
          }
        } catch (e) {
          this.logger.error(
            `Cannot sync [COMPRESSED_NFT_MINT] of signature [${signature}] ${e.stack}`,
          );
        }
      }),
    );
  }

  async countNftByWalletOfSeason(
    seasonId: any,
    wallet?: string,
  ): Promise<KyupadNft[]> {
    if (!wallet) return [];
    const nfts = await this.kyupadNftModel.find({
      owner_address: wallet,
      season_id: seasonId,
    });
    return nfts;
  }

  async mintingRoundRoadMap(seasonId: string): Promise<NftWhiteList[]> {
    const pools = await this.nftWhiteListModel
      .find({
        season_id: String(seasonId),
      })
      .select({
        _id: 1,
        season_id: 1,
        community_name: 1,
        start_time: 1,
        end_time: 1,
        is_active_pool: 1,
        pool_private_whitelist: 1,
      });
    if (!pools || pools.length === 0) return [];
    pools.sort(
      (a, b) =>
        (a.start_time ? new Date(a.start_time).getTime() : 99999999999999) -
        (b.start_time ? new Date(b.start_time).getTime() : 99999999999999),
    );
    return plainToInstance(
      NftWhiteList,
      JSON.parse(JSON.stringify(pools)) as any[],
      {
        groups: ['road-map'],
      },
    );
  }

  async countMintedTotal(
    seasonId: string,
    poolId?: string,
    wallet?: string,
  ): Promise<number> {
    try {
      const query: FilterQuery<KyupadNft> = {
        season_id: seasonId,
        owner_address: {
          $ne: null,
        },
      };
      if (poolId) query.pool_id = poolId;
      if (wallet) query.owner_address = wallet;
      const count = await this.kyupadNftModel.countDocuments(query);
      return count || 0;
    } catch (e) {
      this.logger.error(
        `Can not count nft total of season [${seasonId}] pool [${poolId || 'NONE'}]`,
      );
      return 0;
    }
  }

  async synNftBySignature(
    id: string,
    poolId: string,
    signature: string,
    owner: string,
  ): Promise<void> {
    try {
      await this.kyupadNftModel.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(id),
          request_wallet: owner,
          owner_address: {
            $eq: null,
          },
        },
        { owner_address: owner, pool_id: poolId },
      );
    } catch (e) {}
    const transactions = await this.heliusService.getTxInfo(signature);
    const mintTx = transactions.find(
      (tx) => tx?.type === 'COMPRESSED_NFT_MINT',
    );
    if (mintTx) await this.updateKyuPadNftByTx(mintTx);
  }

  async updateKyuPadNftByTx(transaction: HeliusEventHook): Promise<void> {
    if (
      transaction.events.compressed &&
      transaction.events.compressed.length > 0
    ) {
      const bulkData: AnyBulkWriteOperation<KyupadNft>[] = [];
      const appsyncInputs: AppsyncNftActionInput[] = [];
      const assetIds: string[] = [];
      transaction.events.compressed.forEach((compressedData) => {
        const uri = compressedData?.metadata.uri;
        const info = uri.split('metadata/cnft/')[1].split('/');
        const seasonId = info[0];
        const poolId = info[1];
        const nftId = info[2].replace('.json', '');
        assetIds.push(compressedData.assetId);
        const nftUpdateData: UpdateQuery<KyupadNft> = {
          collection_address: compressedData?.metadata.collection.key,
          nft_address: compressedData?.assetId,
          owner_address: compressedData?.newLeafOwner,
          signature: transaction.signature,
        };
        bulkData.push({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(nftId) },
            update: nftUpdateData,
            upsert: true,
          },
        });
        appsyncInputs.push({
          input: {
            action_type: EUserAction.NFT_MINTED,
            season_id: seasonId,
            pool_id: poolId,
            nft_off_chain_id: nftId,
            minted_wallet: nftUpdateData.owner_address,
            action_at: new Date().toISOString(),
          },
        });
      });
      await this.kyupadNftModel.bulkWrite(bulkData);
      await Promise.all(
        appsyncInputs.map(async (appsyncInput) => {
          await this.pushMintedAction(appsyncInput);
        }),
      );
      this.logger.log(
        `Sync [COMPRESSED_NFT_MINT] of signature [${transaction.signature}] ids [${JSON.stringify(assetIds)}] successful`,
      );
    }
  }

  async getHoldersOfPool(id: any): Promise<string[]> {
    if (!id) return [];
    const pool = await this.nftWhiteListModel.findById(id);
    if (!pool) return [];
    return pool?.holders || [];
  }

  async pushMintedAction(input: AppsyncNftActionInput): Promise<void> {
    NFT_ACTION_SCHEMA.variables = {
      input: {
        ...input.input,
      },
    };
    await this.appsyncService.query<AppsyncNftActionInput, any>(
      NFT_ACTION_SCHEMA,
      {
        cls: AppsyncNftActionInput,
        plain: true,
        functionName: NFT_ACTION_SCHEMA.operationName,
        passError: true,
      },
    );
  }

  async generatePreferCode(wallet: string): Promise<string> {
    const refInfoCheck = await this.refCodeModel.findOne({
      wallet: wallet || '',
    });
    if (refInfoCheck)
      return `${process.env.WEB_URL}/mint-nft?ref_code=${String(refInfoCheck._id)}`;
    const refCodeInfo = await this.refCodeModel.create({
      wallet,
    });
    if (!refCodeInfo)
      throw new InternalServerErrorException('Cannot create ref code');
    return `${process.env.WEB_URL}/mint-nft?ref_code=${String(refCodeInfo._id)}`;
  }

  async getCollectionByListAddress(
    addresses: string[],
  ): Promise<NftCollection[]> {
    const collections = await this.nftCollection.find({
      address: {
        $in: addresses,
      },
    });
    return JSON.parse(JSON.stringify(collections || []));
  }
}
