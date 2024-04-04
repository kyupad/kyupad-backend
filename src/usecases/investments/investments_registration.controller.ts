import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('investments')
@Controller()
export class UserInvestmentsController {
  @Get()
  async registration(): Promise<any> {
    return {
      statusCode: 200,
      data: 'season',
    };
  }
}
