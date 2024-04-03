import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { INftCollectionsResponse } from '@usecases/admin/nft/collections/collections.response';
import { CreateCollectionsInput } from '@usecases/admin/nft/collections/collections.input';
import { AuthGuard } from '@usecases/admin/auth/auth.guard';
import { NftService } from '@/services/nft/nft.service';

@ApiTags('admin')
@Controller()
export class CollectionsController {
  constructor(private readonly nftService: NftService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt-auth')
  async collections(): Promise<INftCollectionsResponse> {
    const collections = await this.nftService.getAllCollection();
    return {
      statusCode: 200,
      data: collections,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt-auth')
  async createCollections(
    @Body() createCollectionInput: CreateCollectionsInput,
  ): Promise<any> {
    await this.nftService.createCollections(createCollectionInput.collections);
    return {
      statusCode: 200,
    };
  }
}
