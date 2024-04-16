import { withBaseResponse } from '@/interfaces/common.interface';
import { Season } from '@schemas/seasons.schema';

class SeasonsResponse extends withBaseResponse(Season, {
  isArray: true,
}) {}

export { SeasonsResponse };
