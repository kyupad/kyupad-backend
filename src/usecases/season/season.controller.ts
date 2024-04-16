import { SeasonService } from '@/services/season/season.service';
import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { SeasonsResponse } from '@usecases/season/season.response';

@Controller()
@ApiTags('season')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get('/active')
  @ApiOperation({ summary: 'Active Season Info' })
  @ApiOkResponse({
    type: SeasonsResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async activeSeason(): Promise<SeasonsResponse> {
    const season = await this.seasonService.activeSeason();
    return {
      statusCode: 200,
      data: season,
    };
  }
}
