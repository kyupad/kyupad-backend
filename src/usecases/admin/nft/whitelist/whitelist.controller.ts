import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@usecases/admin/auth/auth.guard';
import { NftService } from '@/services/nft/nft.service';
import { NftWhiteListResponse } from '@usecases/admin/nft/whitelist/whitelist.response';

@ApiTags('admin')
@Controller()
export class WhiteListController {
  constructor(private readonly nftService: NftService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt-auth')
  async whitelist(): Promise<NftWhiteListResponse> {
    const collections = await this.nftService.getNftWhiteList();
    return {
      statusCode: 200,
      data: collections,
    };
  }
}
