import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NftCollection } from '@schemas/nft_collections.schema';
import { CreateCollectionItem } from '@usecases/admin/nft/collections/collections.input';

@Injectable()
export class NftService {
  constructor(
    @InjectModel(NftCollection.name)
    private readonly nftCollectionModel: Model<NftCollection>,
  ) {}

  async getAllCollection(): Promise<NftCollection[]> {
    const result = await this.nftCollectionModel.find();
    return result;
  }

  async createCollections(
    createCollectionInputs: CreateCollectionItem[],
  ): Promise<void> {
    const collections: NftCollection[] = createCollectionInputs.map((input) => {
      return {
        name: input.name,
        address: input.address,
      };
    });
    await this.nftCollectionModel.insertMany(collections);
  }
}
