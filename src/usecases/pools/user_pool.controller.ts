import { Controller, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('pools')
@Controller()
export class UserPoolController {
  @Get()
  async pools(): Promise<any> {
    return {
      statusCode: 200,
      data: 'season',
    };
  }

  @Post()
  async createPool(): Promise<any> {
    return {
      statusCode: 200,
      data: 'season',
    };
  }

  @Put()
  async updatePool(): Promise<any> {
    return {
      statusCode: 200,
      data: 'season',
    };
  }
}
