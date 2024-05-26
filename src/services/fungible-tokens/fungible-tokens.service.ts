import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getTokenByAddress(
    address: string,
    throwError = true,
  ): Promise<FungibleToken | undefined> {
    const token = await this.fungibleTokenModel.findOne({
      address,
    });
    if (!token && throwError) throw new NotFoundException('Token not found');
    return token
      ? (JSON.parse(JSON.stringify(token)) as FungibleToken)
      : undefined;
  }
}
