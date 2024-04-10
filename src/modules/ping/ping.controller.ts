import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PingResponse } from './ping.type';

@ApiTags('monitoring')
@Controller()
export class PingController {
  @Get()
  @ApiOperation({ summary: 'Ping' })
  @ApiOkResponse({ type: PingResponse })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  ping(): PingResponse {
    return {
      statusCode: HttpStatus.OK,
      data: {
        ping: 'pong',
      },
    };
  }
}
