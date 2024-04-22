import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiBody,
} from '@nestjs/swagger';
import { NftService } from '@/services/nft/nft.service';
import { MintingPoolRoundResponse } from '@usecases/nft/nft.response';
import { NftMintingPoolQuery } from '@usecases/nft/nft.input';
import { ClsService } from 'nestjs-cls';
import { JwtService } from '@nestjs/jwt';
import {
  GenerateCnftMetaDataBody,
  GenerateCnftMetadataResponse,
} from './nft.type';
import { isEmpty } from '@/helpers';

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
    wallet = query.wallet;
    const nft = await this.nftService.mintingPool(query.pool_id, wallet);
    return {
      statusCode: 200,
      data: nft,
    };
  }

  @Post('/metadata')
  @ApiBody({ type: GenerateCnftMetaDataBody })
  @ApiOkResponse({ type: GenerateCnftMetadataResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async uploadMetadata(
    @Body() body: GenerateCnftMetaDataBody,
  ): Promise<GenerateCnftMetadataResponse> {
    if (isEmpty(body)) {
      throw new BadRequestException('body is empty');
    }

    if (!body?.id) {
      throw new BadRequestException('id is required');
    }

    if (!body?.name) {
      throw new BadRequestException('name is required');
    }

    if (typeof body?.seller_fee_basis_points !== 'number') {
      throw new BadRequestException('seller_fee_basis_points is required');
    }

    if (!body?.symbol) {
      throw new BadRequestException('symbol is required');
    }

    const result = await this.nftService.generateCNftMetaData(body);

    return {
      statusCode: 200,
      data: result,
    };
  }
}
