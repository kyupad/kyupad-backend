import { withBaseResponse } from '@/interfaces/common.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

class GenerateCnftMetaDataBody {
  @ApiProperty()
  id: string;
  @ApiProperty({ required: false })
  description?: string;
  @ApiProperty()
  seller_fee_basis_points: number;
  @ApiProperty({ required: false })
  creators?: string[];
  @ApiProperty({ required: false })
  ref_code?: string;
}

class GenerateCnftMetaDataPrivateBody extends GenerateCnftMetaDataBody {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  api_key: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  minter_wallet: string;

  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: false })
  ref_code?: string;
}

class GenerateCnftMetadataResult {
  @ApiProperty()
  url: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  id: string;
}

class GenerateCnftMetadataResponse extends withBaseResponse(
  GenerateCnftMetadataResult,
) {}

export {
  GenerateCnftMetaDataBody,
  GenerateCnftMetadataResponse,
  GenerateCnftMetadataResult,
  GenerateCnftMetaDataPrivateBody,
};
