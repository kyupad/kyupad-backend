import { withBaseResponse } from '@/interfaces/common.interface';
import { Project } from '@/schemas/project.schema';

export class FindAllUpcomingLaunchesResponse extends withBaseResponse(
  Project,
  {},
) {}
