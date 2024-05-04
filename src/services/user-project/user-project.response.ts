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
}
export { UsesProjectAssets };
