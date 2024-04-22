import { withBaseResponse } from '@/interfaces/common.interface';
import { ApiProperty } from '@nestjs/swagger';

class GenerateCnftMetaDataBody {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  symbol: string;
  @ApiProperty({ required: false })
  description?: string;
  @ApiProperty()
  seller_fee_basis_points: number;
  @ApiProperty({ required: false })
  creators?: string[];
}

class GenerateCnftMetadataResult {
  @ApiProperty()
  url: string;
}

class GenerateCnftMetadataResponse extends withBaseResponse(
  GenerateCnftMetadataResult,
) {}

export { GenerateCnftMetaDataBody, GenerateCnftMetadataResponse };
