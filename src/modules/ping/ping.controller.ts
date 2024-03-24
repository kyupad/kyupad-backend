import { Controller, Get } from '@nestjs/common';

@Controller()
export class PingController {
  @Get()
  ping(): string {
    return 'pong';
  }
}
