import { Expose } from 'class-transformer';
import { withBaseResponse } from '@/interfaces/common.interface';
import { ApiProperty } from '@nestjs/swagger';

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
    type: MintingPoolDto,
  })
  community_round: MintingPoolDto;

  @ApiProperty({
    type: MintingPoolDto,
  })
  fcfs_round: MintingPoolDto;
}

class MintingPoolRoundResponse extends withBaseResponse(
  MintingPoolRoundDto,
  {},
) {}

export {
  PoolDto,
  MintingPoolRoundResponse,
  MintingPoolRoundDto,
  MintingPoolDto,
};
