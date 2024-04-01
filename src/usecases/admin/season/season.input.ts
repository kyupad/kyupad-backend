import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class CreateSeasonInput {
  @ApiProperty({
    description: 'Code of the season',
    default: 'season_1',
  })
  @IsNotEmpty()
  season_code: string;

  @ApiProperty({
    description: 'Name of the season',
    default: 'Season 1',
  })
  @IsNotEmpty()
  season_name: string;

  @ApiProperty({
    description: 'List snapshot collections',
    isArray: true,
    type: String,
    default: ['SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W'],
  })
  @IsString({ each: true })
  collections: string[];

  @ApiProperty({
    description: 'Snapshot time (millisecond)',
    type: Number,
    default: 1711913493242,
  })
  @IsNumber()
  snapshot_at: number;
}

class SeasonDetailParams {
  id: string;
}

export { CreateSeasonInput, SeasonDetailParams };
