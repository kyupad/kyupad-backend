import { ApiProperty } from '@nestjs/swagger';

class IHeliusHookBody {
  @ApiProperty({ type: String })
  id: string;
}

export { IHeliusHookBody };
