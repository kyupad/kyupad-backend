import { ApiProperty } from '@nestjs/swagger';

class NftMintingPoolQuery {
  @ApiProperty({
    type: String,
    required: false,
  })
  pool_id?: string;
}

export { NftMintingPoolQuery };
