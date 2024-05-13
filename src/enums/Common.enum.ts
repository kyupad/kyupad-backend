enum ESchedulerType {
  UPCOMING_SNAPSHOT_NFT = 'upcoming_snapshot_nft',
}

enum EDefultResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

enum ETokenType {
  NFT = 'nft',
  FUNGIBLE = 'fungible',
}

enum ETxVerifyStatus {
  NOT_VERIFY = 'not_verified',
  OFF_CHAIN_VERIFY = 'off_chain_verify',
  TX_WEB_HOOK_VERIFY = 'tx_web_hook_verify',
  ON_CHAIN_VERIFY = 'on_chain_verify',
}

export { ESchedulerType, EDefultResponseStatus, ETokenType, ETxVerifyStatus };
