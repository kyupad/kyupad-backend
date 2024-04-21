import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { MintingPoolRoundResponse } from '@usecases/nft/nft.response';
import { DefaultResponse } from '@/interfaces/common.interface';

@Controller()
@ApiTags('common')
export class CommonController {
  constructor() {}

  @Post('/helius/webhook')
  @ApiOkResponse({
    type: MintingPoolRoundResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async hook(@Body() data: any, @Req() req: any): Promise<DefaultResponse> {
    console.log('----req', data, req);
    return {
      statusCode: 200,
      data: { status: 'SUCCESS' },
    };
  }
}
