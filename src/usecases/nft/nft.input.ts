import { ApiProperty } from '@nestjs/swagger';

class NftMintingPoolQuery {
  @ApiProperty({
    type: String,
    required: true,
  })
  season_id: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  pool_id?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  wallet?: string;
}

export { NftMintingPoolQuery };
