type THeliusEvent = 'COMPRESSED_NFT_MINT';

class HeliusEventHook {
  accountData: any[];
  description: string;
  events: {
    compressed: HeliusEventCompressed[];
  };
  fee: number;
  feePayer: string;
  instructions: any[];
  nativeTransfers: [];
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: any[];
  transactionError: any;
  type: THeliusEvent;
}

class HeliusEventCompressed {
  assetId: string;
  innerInstructionIndex: number;
  instructionIndex: number;
  leafIndex: number;
  metadata: {
    collection: {
      key: string;
      verified: boolean;
    };
    creators: string[];
    editionNonce: number;
    isMutable: boolean;
    name: string;
    primarySaleHappened: boolean;
    sellerFeeBasisPoints: number;
    symbol: string;
    tokenProgramVersion: string;
    tokenStandard: string;
    uri: string;
  };
  newLeafDelegate: string;
  newLeafOwner: string;
  oldLeafDelegate: null;
  oldLeafOwner: null;
  seq: number;
  treeDelegate: string;
  treeId: string;
  type: THeliusEvent;
  updateArgs: any;
}

class HeliusIDOTxRawMeta {
  err?: any;

  fee: number;

  logMessages: string[];
}

class HeliusIDOTxRawTransaction {
  message: {
    accountKeys: string[];
  };

  signatures: string[];
}

class HeliusIDOTxRawHook {
  blockTime: number;

  indexWithinBlock: number;

  meta: HeliusIDOTxRawMeta;

  slot: number;

  transaction: HeliusIDOTxRawTransaction;

  version: string;
}

export {
  HeliusEventHook,
  HeliusEventCompressed,
  THeliusEvent,
  HeliusIDOTxRawHook,
  HeliusIDOTxRawMeta,
  HeliusIDOTxRawTransaction,
};
