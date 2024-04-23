import { SeasonService } from '@/services/season/season.service';
import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ActiveSeasonResponse } from '@usecases/season/season.response';
import { NftService } from '@/services/nft/nft.service';

@Controller()
@ApiTags('season')
export class SeasonController {
  constructor(
    private readonly seasonService: SeasonService,
    private readonly nftService: NftService,
  ) {}

  @Get('/active')
  @ApiOperation({ summary: 'Active Season Info' })
  @ApiOkResponse({
    type: ActiveSeasonResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async activeSeason(): Promise<ActiveSeasonResponse> {
    const season = await this.seasonService.activeSeason();
    const [totalMinted, roadMap] = await Promise.all([
      this.nftService.countMintedTotal(String(season._id)),
      this.nftService.mintingRoundRoadMap(String(season._id)),
    ]);
    season.minted_total = totalMinted;
    return {
      statusCode: 200,
      data: {
        season,
        minting_round_road_map: roadMap,
      },
    };
  }
}
