import { withBaseResponse } from '@/interfaces/common.interface';
import { NftWhiteList } from '@schemas/nft_whitelists.schema';
import { ApiProperty } from '@nestjs/swagger';

class NftWhiteListDto extends NftWhiteList {
  @ApiProperty({
    type: String,
    required: true,
  })
  collection_name?: string;
}

class NftWhiteListResponse extends withBaseResponse(NftWhiteListDto, {}) {}

export { NftWhiteListDto, NftWhiteListResponse };
