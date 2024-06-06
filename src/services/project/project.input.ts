import { EIdoAction } from '@/enums';

interface ICatnipAssetsSnapshotBody {
  user_registration_id: string;
  project_id: string;
  user_id: string;
  season_id: string;
}

class AppsyncIdoActionInput {
  input: {
    action_type: EIdoAction;
    project__id: string;
    invested_total: number;
    invested_wallet: string;
    action_at: string;
  };
}

export { ICatnipAssetsSnapshotBody, AppsyncIdoActionInput };
