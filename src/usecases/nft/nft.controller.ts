import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NftService } from '@/services/nft/nft.service';
import {
  GeneratePreferCodeResponse,
  MintingPoolRoundResponse,
} from '@usecases/nft/nft.response';
import {
  NftMintingPoolQuery,
  NftSyncBySignatureInput,
  TestAppsyncInput,
} from '@usecases/nft/nft.input';
import { ClsService } from 'nestjs-cls';
import { JwtService } from '@nestjs/jwt';
import {
  GenerateCnftMetaDataBody,
  GenerateCnftMetadataResponse,
} from './nft.type';
import { isEmpty } from '@/helpers';
import { DefaultResponse } from '@/interfaces/common.interface';
import { EUserAction } from '@/enums';

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

    if (typeof body?.seller_fee_basis_points !== 'number') {
      throw new BadRequestException('seller_fee_basis_points is required');
    }
    const accessToken = this.cls.get('accessToken');
    let wallet;
    if (accessToken) {
      const userInfo = this.jwtService.decode(accessToken) as any;
      wallet = userInfo?.sub;
    }
    const result = await this.nftService.generateCNftMetaData(body, wallet);

    return {
      statusCode: 200,
      data: result,
    };
  }

  @Post('/sync-nft-by-signature')
  @ApiBody({ type: NftSyncBySignatureInput })
  @ApiOkResponse({ type: DefaultResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async synNftBySignature(
    @Body() nftSyncBySignatureInput: NftSyncBySignatureInput,
  ): Promise<DefaultResponse> {
    const accessToken = this.cls.get('accessToken');
    let wallet;
    if (accessToken) {
      const userInfo = this.jwtService.decode(accessToken) as any;
      wallet = userInfo?.sub;
    }
    if (wallet)
      await this.nftService.synNftBySignature(
        String(nftSyncBySignatureInput.id),
        nftSyncBySignatureInput.pool_id,
        nftSyncBySignatureInput.signature,
        wallet,
      );
    return {
      statusCode: 200,
      data: {
        status: 'SUCCESS',
      },
    };
  }

  @Post('/test-appsync')
  @ApiBody({ type: TestAppsyncInput })
  @ApiOkResponse({ type: DefaultResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async pushMintedAction(
    @Body() input: TestAppsyncInput,
  ): Promise<DefaultResponse> {
    if (process.env.STAGE !== 'dev')
      return {
        statusCode: 200,
        data: {
          status: 'SUCCESS',
        },
      };
    else
      await this.nftService.pushMintedAction({
        input: {
          ...input,
          action_type: EUserAction.NFT_MINTED,
          action_at: new Date().toISOString(),
        },
      });
    return {
      statusCode: 200,
      data: {
        status: 'SUCCESS',
      },
    };
  }

  @Get('/generate-ref-code')
  @ApiOkResponse({
    type: GeneratePreferCodeResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async generatePreferCode(): Promise<GeneratePreferCodeResponse> {
    const accessToken = this.cls.get('accessToken');
    if (!accessToken) throw new UnauthorizedException();
    const userInfo = this.jwtService.decode(accessToken) as any;
    const wallet = userInfo?.sub;
    if (!wallet) throw new UnauthorizedException();
    const preferUrl = await this.nftService.generatePreferCode(wallet);
    return {
      statusCode: 200,
      data: {
        ref_url: preferUrl,
      },
    };
  }
}
