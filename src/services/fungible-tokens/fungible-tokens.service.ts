import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { FungibleToken } from '@/schemas/fungible_tokens.schema';

@Injectable()
export class FungibleTokensService {
  constructor(
    @InjectModel(FungibleToken.name)
    private readonly fungibleTokenModel: Model<FungibleToken>,
  ) {}

  async findTokens(
    filter: FilterQuery<FungibleToken>,
  ): Promise<FungibleToken[]> {
    const tokens = await this.fungibleTokenModel.find(filter);
    return JSON.parse(JSON.stringify(tokens || []));
  }
}
