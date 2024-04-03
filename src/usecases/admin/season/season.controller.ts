import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@usecases/admin/auth/auth.guard';
import { CreateSeasonInput } from '@usecases/admin/season/season.input';
import { SeasonService } from '@/services/season/season.service';
import { SeasonDetailResponse } from '@usecases/admin/season/season.response';

@ApiTags('admin')
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
    @Req() req: any,
    @Param('id') params: string,
  ): Promise<SeasonDetailResponse> {
    const season = await this.seasonService.seasonDetail(params);
    return {
      statusCode: 200,
      data: season,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiOkResponse({ type: SeasonDetailResponse })
  async createSeason(
    @Body() createSeasonInput: CreateSeasonInput,
  ): Promise<SeasonDetailResponse> {
    const season = await this.seasonService.createSeason(createSeasonInput);
    return {
      statusCode: 200,
      data: season,
    };
  }
}
