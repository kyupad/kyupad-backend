import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { NftService } from '@/services/nft/nft.service';
import { MintingPoolRoundResponse } from '@usecases/nft/nft.response';
import { NftMintingPoolQuery } from '@usecases/nft/nft.input';
import { ClsService } from 'nestjs-cls';
import { JwtService } from '@nestjs/jwt';

@Controller()
@ApiTags('nft')
export class NftController {
  constructor(
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
    private readonly nftService: NftService,
  ) {}

  @Get('/minting-pool')
  @ApiOkResponse({
    type: MintingPoolRoundResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async activeNft(
    @Query() query: NftMintingPoolQuery,
  ): Promise<MintingPoolRoundResponse> {
    const accessToken = this.cls.get('accessToken');
    let wallet;
    if (accessToken) {
      const userInfo = this.jwtService.decode(accessToken) as any;
      wallet = userInfo?.sub;
    }
    const nft = await this.nftService.mintingPool(query.pool_id, wallet);
    return {
      statusCode: 200,
      data: nft,
    };
  }
}
