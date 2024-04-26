import { Expose } from 'class-transformer';
import { withBaseResponse } from '@/interfaces/common.interface';
import { ApiProperty } from '@nestjs/swagger';
import { NftWhiteList } from '@schemas/nft_whitelists.schema';
import { Prop } from '@nestjs/mongoose';
import { Creator } from '@schemas/seasons.schema';

class PoolDto {
  @Expose({ groups: ['detail', 'list'] })
  @ApiProperty({
    type: String,
    required: true,
  })
  pool_id: string;

  @Expose({ groups: ['detail', 'list'] })
  @ApiProperty({
    type: String,
    required: true,
  })
  pool_name: string;

  @Expose({ groups: ['detail', 'list'] })
  @ApiProperty({
    type: String,
    required: true,
  })
  pool_symbol: string;

  @Expose({ groups: ['detail'] })
  @ApiProperty({
    type: String,
    required: false,
  })
  pool_image?: string;

  @Expose({ groups: ['detail'] })
  @ApiProperty({
    type: Number,
    required: true,
  })
  pool_supply: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @Expose({ groups: ['detail'] })
  minted_total: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @Expose({ groups: ['detail'] })
  total_mint_per_wallet: number;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @Expose({ groups: ['detail'] })
  mint_fee: number;

  @Expose({ groups: ['detail'] })
  @ApiProperty({
    type: Date,
    required: true,
  })
  start_time?: string | Date;

  @Expose({ groups: ['detail'] })
  @ApiProperty({
    type: Date,
    required: true,
  })
  end_time?: string | Date;

  @Expose({ groups: ['detail'] })
  @ApiProperty({
    type: Boolean,
    required: false,
  })
  is_active?: boolean;

  @Expose({ groups: ['detail'] })
  @ApiProperty({
    type: Boolean,
    required: false,
  })
  is_minted?: boolean;

  @Expose({ groups: ['detail'] })
  @ApiProperty({
    type: String,
    required: false,
  })
  merkle_proof?: string;

  @Expose({ groups: ['detail'] })
  @ApiProperty({
    type: String,
    required: false,
  })
  merkle_proof_dev?: string;

  @ApiProperty({
    type: String,
  })
  destination_wallet?: string;

  @ApiProperty({
    type: String,
  })
  user_pool_minted_total?: number;
}

class MintingPoolDto {
  @ApiProperty({
    isArray: true,
    type: PoolDto,
  })
  active_pools?: PoolDto[];

  @ApiProperty({
    type: PoolDto,
  })
  current_pool: PoolDto;
}

class MintingPoolRoundDto {
  @ApiProperty({
    type: String,
  })
  collection_address?: string;

  @ApiProperty({
    type: String,
  })
  contract_address?: string;

  @ApiProperty({
    type: String,
  })
  merkle_tree?: string;

  @ApiProperty({
    type: String,
  })
  lookup_table_address?: string;

  @ApiProperty({
    type: MintingPoolDto,
  })
  community_round: MintingPoolDto;

  @ApiProperty({
    type: MintingPoolDto,
  })
  fcfs_round: MintingPoolDto;

  @ApiProperty({
    type: Creator,
    required: true,
  })
  creators?: Creator[];

  @ApiProperty({
    type: Number,
    required: true,
  })
  seller_fee_basis_points: number;
}

class MintingPoolRoundResponse extends withBaseResponse(
  MintingPoolRoundDto,
  {},
) {}

class MintingRoundRoadMapResponse extends withBaseResponse(NftWhiteList, {
  isArray: true,
}) {}

export {
  PoolDto,
  MintingPoolRoundResponse,
  MintingPoolRoundDto,
  MintingPoolDto,
  MintingRoundRoadMapResponse,
};
