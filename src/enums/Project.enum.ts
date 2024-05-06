enum EProjectType {
  'upcoming' = 'upcoming',
  'success' = 'success',
}

enum EProjectSalePool {
  'Subscription' = 'Subscription',
}

enum EProjectVestingType {
  'Milestone' = 'Milestone',
}

enum EProjectStatus {
  COLLECTION_PRICE_SNAPSHOT_PROCESSING = 'collection_price_snapshot_processing',
  COLLECTION_PRICE_SNAPSHOT_ERROR = 'collection_price_snapshot_error',
  ACTIVE = 'active',
  DRAFT = 'draft',
}

enum EProjectProgressStatus {
  UP_COMING = 'up_coming',
  REGISTRATION = 'registration',
  SNAPSHOTTING = 'snapshotting',
  INVESTING = 'investing',
  VESTING = 'vesting',
  FINISHED = 'finished',
}

enum EProjectUserAssetType {
  FUNGIBLE = 'fungible',
  STABLE_COIN = 'stable_coin',
  NFT = 'nft',
}

export {
  EProjectType,
  EProjectSalePool,
  EProjectVestingType,
  EProjectStatus,
  EProjectProgressStatus,
  EProjectUserAssetType,
};
