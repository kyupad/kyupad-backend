import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FungibleToken,
  FungibleTokenSchema,
} from '@schemas/fungible_tokens.schema';
import { FungibleService } from '@/services/fungible/fungible.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FungibleToken.name, schema: FungibleTokenSchema },
    ]),
  ],
  controllers: [],
  providers: [FungibleService],
  exports: [FungibleService],
})
export class FungibleServiceModule {}
