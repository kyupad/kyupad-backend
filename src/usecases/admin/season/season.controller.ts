import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@usecases/admin/auth/auth.guard';
import { CreateSeasonInput } from '@usecases/admin/season/season.input';
import { SeasonService } from '@/services/season/season.service';
import { Season } from '@schemas/seasons.schema';
import { SeasonDetailResponse } from '@usecases/admin/season/season.response';

@Controller()
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiOkResponse({ type: SeasonDetailResponse })
  async seasonDetail(
    @Param('id') params: string,
  ): Promise<SeasonDetailResponse> {
    console.log(params);
    const season = await this.seasonService.seasonDetail(params);
    return {
      statusCode: 200,
      data: season,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiOkResponse({ type: Season })
  async createSeason(
    @Body() createSeasonInput: CreateSeasonInput,
  ): Promise<any> {
    await this.seasonService.createSeason(createSeasonInput);
    return {
      statusCode: 200,
    };
  }
}
