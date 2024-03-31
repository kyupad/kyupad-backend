import { NftCollection } from '@schemas/nft_collections.schema';

interface INftCollectionsResponse extends IResponseBase {
  data: NftCollection[];
}

export { INftCollectionsResponse };
