import { withBaseResponse } from '@/interfaces/common.interface';
import { Season } from '@schemas/seasons.schema';
import { ApiProperty } from '@nestjs/swagger';
import { NftWhiteList } from '@schemas/nft_whitelists.schema';

class ActiveSeasonDto {
  @ApiProperty({ type: Season })
  season: Season;

  @ApiProperty({ type: NftWhiteList, isArray: true })
  minting_round_road_map: NftWhiteList[];
}

class ActiveSeasonResponse extends withBaseResponse(ActiveSeasonDto, {}) {}

export { ActiveSeasonResponse, ActiveSeasonDto };
