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

export { EProjectType, EProjectSalePool, EProjectVestingType, EProjectStatus };
