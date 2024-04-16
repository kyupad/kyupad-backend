import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { NftService } from '@/services/nft/nft.service';
import { MintingPoolRoundResponse } from '@usecases/nft/nft.response';
import { NftMintingPoolQuery } from '@usecases/nft/nft.input';

@Controller()
@ApiTags('nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get('/minting-pool')
  @ApiOkResponse({
    type: MintingPoolRoundResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async activeNft(
    @Query() query: NftMintingPoolQuery,
  ): Promise<MintingPoolRoundResponse> {
    const nft = await this.nftService.mintingPool(
      query.season_id,
      query.pool_id,
      query.wallet,
    );
    return {
      statusCode: 200,
      data: nft,
    };
  }
}
