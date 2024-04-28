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
import { ClsService } from 'nestjs-cls';
import { JwtService } from '@nestjs/jwt';
import { NftWhiteList } from '@schemas/nft_whitelists.schema';

@Controller()
@ApiTags('season')
export class SeasonController {
  constructor(
    private readonly seasonService: SeasonService,
    private readonly nftService: NftService,
    private readonly cls: ClsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('/active')
  @ApiOperation({ summary: 'Active Season Info' })
  @ApiOkResponse({
    type: ActiveSeasonResponse,
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async activeSeason(): Promise<ActiveSeasonResponse> {
    const accessToken = this.cls.get('accessToken');
    let wallet;
    if (accessToken) {
      const userInfo = this.jwtService.decode(accessToken) as any;
      wallet = userInfo?.sub;
    }
    const season = await this.seasonService.activeSeason();
    const arrFn: (Promise<number> | Promise<NftWhiteList[]>)[] = [
      this.nftService.countMintedTotal(String(season._id)),
      this.nftService.mintingRoundRoadMap(String(season._id)),
    ];
    if (wallet)
      arrFn.push(
        this.nftService.countMintedTotal(String(season._id), undefined, wallet),
      );
    const results = await Promise.all(arrFn);
    season.minted_total = results[0] as number;
    if (wallet) season.my_minted_total = results[2] as number;
    season.total = 9999;
    return {
      statusCode: 200,
      data: {
        season,
        minting_round_road_map: results[1] as NftWhiteList[],
      },
    };
  }
}
