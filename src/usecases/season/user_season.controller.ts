import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('seasons')
@Controller()
export class UserSeasonController {
  @Get()
  async seasonDetail(): Promise<any> {
    return {
      statusCode: 200,
      data: 'season',
    };
  }
}
