import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FungibleToken } from '@schemas/fungible_tokens.schema';

@Injectable()
export class FungibleService {
  constructor(
    @InjectModel(FungibleToken.name)
    private readonly fungibleTokenModel: Model<FungibleToken>,
  ) {}

  async getAllFungibleToken(): Promise<FungibleToken[]> {
    const result = await this.fungibleTokenModel.find();
    return result || [];
  }

  async createFungibleToken(fungibleTokens: FungibleToken[]): Promise<void> {
    await this.fungibleTokenModel.insertMany(fungibleTokens);
  }
}
