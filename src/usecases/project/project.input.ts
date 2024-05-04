import { ETokenType } from '@/enums';
import { ApiProperty } from '@nestjs/swagger';

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

class UserRegistrationQuery {
  @ApiProperty({ type: String })
  wallet?: string;
}

export { CatnipAssetHolder, UserRegistrationQuery };
