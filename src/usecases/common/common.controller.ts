import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { MintingPoolRoundResponse } from '@usecases/nft/nft.response';
import { DefaultResponse } from '@/interfaces/common.interface';
import { NftService } from '@/services/nft/nft.service';
import { HeliusEventHook } from '@/services/helius/helius.response';

@Controller()
@ApiTags('common')
export class CommonController {
  constructor(private readonly nftService: NftService) {}

  @Post('/helius/webhook')
  @ApiOkResponse({
    type: MintingPoolRoundResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async hook(
    @Body() data: HeliusEventHook[],
    @Req() req: any,
  ): Promise<DefaultResponse> {
    await this.nftService.syncNftFromWebHook(
      data,
      req.headers['authorization'],
    );
    return {
      statusCode: 200,
      data: {
        status: 'SUCCESS',
      },
    };
  }
}
