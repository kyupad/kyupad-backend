import { ApiProperty } from '@nestjs/swagger';

class UsesProjectAssets {
  @ApiProperty({
    type: Number,
  })
  total_assets: number;

  @ApiProperty({
    type: Number,
  })
  participants: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  chance_of_winning?: number;

  _id?: any;
}

export { UsesProjectAssets };
