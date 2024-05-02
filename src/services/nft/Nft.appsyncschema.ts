import { IAppSyncBody } from '@/services/aws/appsync/appsync.input';
import { AppsyncNftActionInput } from '@/services/nft/nft.input';

const NFT_ACTION_SCHEMA: IAppSyncBody<AppsyncNftActionInput> = {
  query: `mutation nftAction($input: INftActionInput!) {
      nftAction(input: $input) {
        action_type
        season_id
        pool_id
        nft_off_chain_id
        minted_wallet
        action_at
      }
    }
  `,
  operationName: 'nftAction',
};
export { NFT_ACTION_SCHEMA };
