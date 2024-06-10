enum EProjectType {
  'upcoming' = 'upcoming',
  'success' = 'success',
  'furture' = 'furture',
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

enum EPUserStatus {
  REGISTRATION_PROCESSING = 'registration_processing',
  RAFFLE_ROUND_SETTING = 'raffle_round_setting',
  PROJECT_RAFFLE_PROCESSING = 'project_raffle_processing',
  PROJECT_INVESTMENT_SETTING_PROCESSING = 'project_investment_setting_processing',
  PROJECT_INVESTMENT_SETTING_SUCCESSFUL = 'project_investment_setting_successful',
  PROJECT_VESTING_SETTING_PROCESSING = 'project_vesting_setting_processing',
  PROJECT_VESTING_SETTING_SUCCESSFUL = 'project_vesting_setting_successful',
}

enum EProjectParticipationStatus {
  ONGOING = 'ongoing',
  ENDED = 'ended',
  WON = 'won',
}

enum EVestingType {
  CLIFF = 'cliff',
  LINEAR = 'linear',
}

enum EAmountPeriodType {
  PERCENT = 'percent',
  TOKEN = 'token',
}

enum EIdoAction {
  INVESTED = 'INVESTED',
  REFUNDED = 'REFUNDED',
}

export {
  EProjectType,
  EProjectSalePool,
  EProjectVestingType,
  EProjectStatus,
  EProjectProgressStatus,
  EProjectUserAssetType,
  EPUserStatus,
  EProjectParticipationStatus,
  EVestingType,
  EAmountPeriodType,
  EIdoAction,
};
