import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { EUserAction } from '@/enums';

class NftMintingPoolQuery {
  @ApiProperty({
    type: String,
    required: false,
  })
  pool_id?: string;
}

class NftSyncBySignatureInput {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  id?: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  pool_id: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  signature: string;
}

class TestAppsyncInput {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  season_id: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  pool_id: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  minted_wallet: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  nft_off_chain_id: string;
}

export { NftMintingPoolQuery, NftSyncBySignatureInput, TestAppsyncInput };
