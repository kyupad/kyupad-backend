import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  FungibleToken,
  FungibleTokenSchema,
} from '@/schemas/fungible_tokens.schema';
import { FungibleTokensService } from './fungible-tokens.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FungibleToken.name,
        schema: FungibleTokenSchema,
      },
    ]),
  ],
  providers: [FungibleTokensService],
  exports: [FungibleTokensService],
})
export class FungibleTokensModule {}
