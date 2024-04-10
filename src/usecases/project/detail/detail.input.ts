import { ETokenType } from '@/enums';

class CatnipAssetHolder {
  type: ETokenType;

  info: [
    {
      address: string;
      balance?: number;
      supply?: number;
      price?: {
        price_per_token: number;
        total_price: number;
        currency: 'USDC';
      };
    },
  ];
}

export { CatnipAssetHolder };
