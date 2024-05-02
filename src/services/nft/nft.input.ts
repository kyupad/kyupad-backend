import { EUserAction } from '@/enums';

class AppsyncNftActionInput {
  input: {
    action_type: EUserAction;
    season_id: string;
    pool_id: string;
    nft_off_chain_id?: string;
    minted_wallet?: string;
    action_at: string;
  };
}

export { AppsyncNftActionInput };
