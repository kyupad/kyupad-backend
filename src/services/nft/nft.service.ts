import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SeasonService } from '@/services/season/season.service';
import { NftWhiteList } from '@schemas/nft_whitelists.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { MintingPoolRoundDto, PoolDto } from '@usecases/nft/nft.response';
import { encrypt, getMerkleProof, getMerkleProof2 } from '@/helpers';

@Injectable()
export class NftService {
  constructor(
    @InjectModel(NftWhiteList.name)
    private readonly nftWhiteListModel: Model<NftWhiteList>,
    @Inject(SeasonService)
    private readonly seasonService: SeasonService,
  ) {}

  async mintingPool(
    seasonId: string,
    poolId?: string,
    wallet?: string,
  ): Promise<MintingPoolRoundDto> {
    const season = await this.seasonService.getSeasonById(seasonId);
    if (!season.is_active)
      throw new BadRequestException('Season is not active');
    const pools = await this.listPool({
      season_id: seasonId,
    });
    const response = new MintingPoolRoundDto();
    const activePools: PoolDto[] = [];
    pools.forEach((pool, idx) => {
      if (pool.collection && pool.collection.length > 0) {
        const collection = pool.collection[0];
        const mintingPool: PoolDto = {
          pool_id: String(pool._id || 'NONE'),
          pool_name: collection.name,
          pool_symbol: collection.symbol,
          start_time: pool.start_time,
          end_time: pool.end_time,
          mint_fee: pool.mint_fee,
          minted_total: 0,
          pool_supply: pool.pool_supply,
          total_mint_per_wallet: pool.total_mint_per_wallet,
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
            if (process.env.STAGE === 'dev') {
              const merkleRoofDev = getMerkleProof2(
                pool.holders || [],
                wallet || '',
              );
              mintingPool.merkle_proof_dev = encrypt(
                JSON.stringify(merkleRoofDev),
                process.env.CRYPTO_ENCRYPT_TOKEN as string,
              );
            }
          }
        } else if (
          (idx === 0 && !poolId) ||
          (poolId &&
            idx !== 0 &&
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
            if (process.env.STAGE === 'dev') {
              const merkleRoofDev = getMerkleProof2(
                pool.holders || [],
                wallet || '',
              );
              mintingPool.merkle_proof_dev = encrypt(
                JSON.stringify(merkleRoofDev),
                process.env.CRYPTO_ENCRYPT_TOKEN as string,
              );
            }
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
}
