import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsString()
  wallet: string;
}

export { NftMintingPoolQuery, NftSyncBySignatureInput };
