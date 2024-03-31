import { ApiParam, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

class CreateSeasonInput {
  @ApiProperty({
    description: 'Code of the season',
  })
  @IsNotEmpty()
  season_code: string;

  @ApiProperty({
    description: 'Name of the season',
  })
  @IsNotEmpty()
  season_name: string;

  @ApiProperty({
    description: 'List snapshot collections',
    isArray: true,
    type: String,
  })
  @IsString({ each: true })
  collections: string[];

  @ApiProperty({
    description: 'Snapshot time (millisecond)',
    type: Number,
  })
  @IsNumber()
  snapshot_at: number;
}

class SeasonDetailParams {
  id: string;
}

export { CreateSeasonInput, SeasonDetailParams };
