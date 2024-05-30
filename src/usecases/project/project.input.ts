import { EAmountPeriodType, ETokenType, EVestingType } from '@/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

class AmountPeriod {
  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    enum: EAmountPeriodType,
    required: true,
  })
  @IsEnum(EAmountPeriodType)
  amount_type: EAmountPeriodType;
}

class VestingScheduleInput {
  @ApiProperty({
    enum: EVestingType,
    required: true,
  })
  @IsEnum(EVestingType)
  vesting_type: EVestingType;

  @ApiProperty({
    type: Number,
    required: true,
  })
  @IsNumber()
  @ValidateIf((x) => x.vesting_type !== EVestingType.CLIFF)
  period: number;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsString()
  start_at: string;

  @ApiProperty({
    type: AmountPeriod,
    required: false,
  })
  @ValidateNested()
  @Type(() => AmountPeriod)
  amount_per_period?: AmountPeriod;
}

class MyVestingQuery {
  @ApiProperty({
    type: String,
    required: true,
  })
  project_slug: string;
}

class EmailTestInput {
  @ApiProperty({
    type: String,
    required: true,
  })
  email: string;
}

export {
  CatnipAssetHolder,
  UserRegistrationQuery,
  GenerateInvestingIdInput,
  SyncInvestingBySignatureInput,
  VestingScheduleInput,
  MyVestingQuery,
  EmailTestInput,
};
