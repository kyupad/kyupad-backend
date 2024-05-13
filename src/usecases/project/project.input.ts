import { ETokenType } from '@/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
  @ApiProperty({ type: String, required: false })
  wallet?: string;
}

class GenerateInvestingIdInput {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  project_id: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  invest_total: number;
}

class SyncInvestingBySignatureInput {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty()
  project__id: string;

  @ApiProperty({ type: Number, required: true })
  @IsNumber()
  total: number;

  @ApiProperty({ type: String, required: true })
  @IsString()
  signature: string;
}

export {
  CatnipAssetHolder,
  UserRegistrationQuery,
  GenerateInvestingIdInput,
  SyncInvestingBySignatureInput,
};
