import { withBaseResponse } from '@/interfaces/common.interface';
import { NftWhiteList } from '@schemas/nft_whitelists.schema';

class NftWhiteListDto extends NftWhiteList {
  collection_name?: string;
}

class NftWhiteListResponse extends withBaseResponse(NftWhiteListDto, {}) {}

export { NftWhiteListDto, NftWhiteListResponse };
