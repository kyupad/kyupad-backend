import { withBaseResponse } from '@/interfaces/common.interface';
import { ApiProperty } from '@nestjs/swagger';

class PingResult {
  @ApiProperty({ default: 'pong' })
  ping: 'pong';
}
class PingResponse extends withBaseResponse(PingResult) {}

export { PingResponse };
