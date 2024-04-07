import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NftCollection } from '@schemas/nft_collections.schema';
import { CreateCollectionItem } from '@usecases/admin/nft/collections/collections.input';
import { NftWhiteListDto } from '@usecases/admin/nft/whitelist/whitelist.response';
import { NftWhiteList } from '@schemas/nft_whitelists.schema';

@Injectable()
export class NftService {
  constructor(
    @InjectModel(NftCollection.name)
    private readonly nftCollectionModel: Model<NftCollection>,
    @InjectModel(NftWhiteList.name)
    private readonly nftWhiteListModel: Model<NftWhiteList>,
  ) {}

  async getAllCollection(): Promise<NftCollection[]> {
    const result = await this.nftCollectionModel.find();
    return result || [];
  }

  async getCollectionByAddress(address: string[]): Promise<NftCollection[]> {
    const result = await this.nftCollectionModel.find({
      address: { $in: address },
    });
    return result || [];
  }

  async createCollections(
    createCollectionInputs: CreateCollectionItem[],
  ): Promise<void> {
    const collections: NftCollection[] = createCollectionInputs.map((input) => {
      return {
        name: input.name,
        address: input.address,
        created_by: 'ADMIN', //FIXME: Sau khi làm chức năng Auth thì update
      };
    });
    await this.nftCollectionModel.insertMany(collections);
  }

  async getNftWhiteList(): Promise<NftWhiteListDto[]> {
    const whiteList = await this.nftWhiteListModel.aggregate([
      {
        $lookup: {
          from: 'nftcollections',
          localField: 'collection_address',
          foreignField: 'address',
          as: 'collection',
        },
      },
    ]);
    const result: NftWhiteListDto[] = whiteList.map((wl) => {
      wl.holders.length = 5;
      return {
        _id: wl._id,
        holders: wl.holders,
        collection_address: wl.collection_address,
        collection_name: wl.collection[0].name,
        created_by: wl.created_by,
      };
    });
    return result;
  }
}
