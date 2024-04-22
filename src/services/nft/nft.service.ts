import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SeasonService } from '@/services/season/season.service';
import { NftWhiteList } from '@schemas/nft_whitelists.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { MintingPoolRoundDto, PoolDto } from '@usecases/nft/nft.response';
import { encrypt, getMerkleProof, isEmpty } from '@/helpers';
import { ConfigService } from '@nestjs/config';
import { S3Service } from '../aws/s3/s3.service';
import { GenerateCnftMetaDataBody } from '@/usecases/nft/nft.type';
import { KyupadNft } from '@schemas/kyupad_nft.schema';

@Injectable()
export class NftService {
  private readonly AWS_S3_BUCKET_URL: string;
  private readonly WEB_URL: string;

  constructor(
    @InjectModel(NftWhiteList.name)
    private readonly nftWhiteListModel: Model<NftWhiteList>,
    @InjectModel(KyupadNft.name)
    private readonly kyupadNftModel: Model<KyupadNft>,
    @Inject(SeasonService)
    private readonly seasonService: SeasonService,
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
    const season = await this.seasonService.activeSeason();
    const pools = await this.listPool({
      season_id: season._id,
      is_active_pool: true,
    });
    if (!pools || pools.length === 0)
      throw new BadRequestException('Pools of season not found');
    const response = new MintingPoolRoundDto();
    response.collection_address = season.nft_collection?.address;
    response.contract_address = season.nft_contract;
    const activePools: PoolDto[] = [];
    pools.forEach((pool, idx) => {
      if (pool.collection && pool.collection.length > 0) {
        const collection = pool.collection[0];
        const mintingPool: PoolDto = {
          pool_id: String(pool._id || 'NONE'),
          pool_name: collection.name,
          pool_symbol: season.nft_collection?.symbol || 'KYUPAD',
          start_time: pool.start_time,
          end_time: pool.end_time,
          mint_fee: pool.mint_fee,
          minted_total: 0,
          pool_supply: pool.pool_supply,
          total_mint_per_wallet: pool.total_mint_per_wallet,
          pool_image: collection.icon,
        };
        if (collection.symbol === 'FCFS') {
          mintingPool.is_active = pool.holders?.includes(wallet || 'NONE');
          response.fcfs_round = {
            current_pool: mintingPool,
          };
          if (mintingPool.is_active) {
            const merkleRoof = getMerkleProof(pool.holders || [], wallet || '');
            mintingPool.merkle_proof = encrypt(
              JSON.stringify(merkleRoof),
              process.env.CRYPTO_ENCRYPT_TOKEN as string,
            );
          }
        } else if (
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
          mintingPool.is_active = pool.holders?.includes(wallet || 'NONE');
          response.community_round = {
            current_pool: mintingPool,
          };
          activePools.push(
            plainToInstance(PoolDto, mintingPool, {
              excludeExtraneousValues: true,
              groups: ['list'],
            }),
          );
          if (mintingPool.is_active) {
            const merkleRoof = getMerkleProof(pool.holders || [], wallet || '');
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
    });
    response.community_round = {
      ...response.community_round,
      active_pools: activePools,
    };
    return response;
  }

  async listPool(filter: FilterQuery<NftWhiteList>): Promise<NftWhiteList[]> {
    const pools: NftWhiteList[] = await this.nftWhiteListModel.aggregate([
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
        $sort: { order: 1 },
      },
    ]);
    return pools.map((pool) => {
      if (pool.is_other_community) {
        pool.collection = [
          {
            _id: `community-${pool.order}`,
            address: `community-${pool.order}`,
            name: pool.community_name || `community-${pool.order}`,
            symbol: `COMMUNITY-${pool.order}`,
            icon: 's3://public/icons/nfts/community.png'.replace(
              's3://',
              `${process.env.AWS_S3_BUCKET_URL}/`,
            ),
          },
        ];
      } else if (pool.collection_address === `FCFS-${pool.season_id}`) {
        pool.collection = [
          {
            _id: `FCFS-${pool.season_id}`,
            address: `FCFS-${pool.season_id}`,
            name: 'First come first serve',
            symbol: 'FCFS',
            icon: 's3://public/icons/nfts/fcfs.png'.replace(
              's3://',
              `${process.env.AWS_S3_BUCKET_URL}/`,
            ),
          },
        ];
      }
      return pool;
    });
  }

  async generateCNftMetaData({
    name,
    symbol,
    description,
    seller_fee_basis_points,
    creators,
    id,
  }: GenerateCnftMetaDataBody) {
    const season = await this.seasonService.activeSeason();
    const session = await this.connection.startSession();
    const url = await session.withTransaction(async () => {
      const nftInput: KyupadNft = {
        pool_id: id,
        nft_name: name,
        season_id: String(season._id),
      };
      const results = await this.kyupadNftModel.create([nftInput], { session });
      const nft = results[0];
      if (!nft || !nft._id)
        throw new BadRequestException('Can not generate nft uri');
      const metadata = {
        name,
        description,
        symbol,
        image: this.AWS_S3_BUCKET_URL + '/public/images/nft/kyupad.jpg',
        external_url: this.WEB_URL,
        seller_fee_basis_points,
        attributes: [],
        properties: {
          files: [
            {
              id: 'portrait',
              uri: this.AWS_S3_BUCKET_URL + '/public/images/nft/kyupad.jpg',
              type: 'image/jpeg',
            },
          ],
          category: 'image',
          collection: {
            name,
            family: symbol,
          },
          creators: isEmpty(creators) ? [] : creators,
          pool_id: id,
          off_chain_id: String(nft._id),
        },
      };
      const key = `public/metadata/cnft/${nftInput.season_id}/${String(nft._id)}.json`;
      const url = await this.s3Service.uploadCnftMetadata({
        data: JSON.stringify(metadata),
        key,
      });
      return url;
    });
    await session.endSession();
    return url;
  }
}
