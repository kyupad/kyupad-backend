import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('monitoring')
@Controller()
export class PingController {
  @Get()
  ping(): string {
    return 'pong';
  }
}
