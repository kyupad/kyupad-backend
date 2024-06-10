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
import {
  HeliusEventHook,
  HeliusIDOTxRawHook,
} from '@/services/helius/helius.response';
import { UserProjectService } from '@/services/user-project/user-project.service';

@Controller()
@ApiTags('common')
export class CommonController {
  constructor(
    private readonly nftService: NftService,
    private readonly userProjectService: UserProjectService,
  ) {}

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

  @Post('/helius/ido-webhook')
  @ApiOkResponse({
    type: MintingPoolRoundResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async idoWebHook(
    @Body() data: HeliusIDOTxRawHook[],
    @Req() req: any,
  ): Promise<DefaultResponse> {
    await this.userProjectService.syncInvestingFromHook(
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
