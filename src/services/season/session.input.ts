import { NftCollection } from '@schemas/nft_collections.schema';

type TNotificationType = 'upcoming_nft_snapshot';

interface INftSnapshotUpcomingNotificationSchedulerInput {
  type: TNotificationType;

  season_id: string;

  season: string;

  snapshot_at?: string;

  collectionName?: string[];
}

interface INftSnapshotSchedulerInput {
  season_id: string;

  season_name: string;

  collections: NftCollection[];
}

export {
  INftSnapshotUpcomingNotificationSchedulerInput,
  INftSnapshotSchedulerInput,
};
