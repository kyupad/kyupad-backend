import { withBaseResponse } from '@/interfaces/common.interface';
import { Season } from '@schemas/seasons.schema';

export class SeasonDetailResponse extends withBaseResponse(Season, {}) {}
