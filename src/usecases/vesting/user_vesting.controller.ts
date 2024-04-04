import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('vesting')
@Controller()
export class UserVestingController {
  @Get()
  async registration(): Promise<any> {
    return {
      statusCode: 200,
      data: 'season',
    };
  }
}
