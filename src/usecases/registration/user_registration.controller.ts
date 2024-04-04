import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('registration')
@Controller()
export class UserRegistrationController {
  @Get()
  async registration(): Promise<any> {
    return {
      statusCode: 200,
      data: 'season',
    };
  }
}
