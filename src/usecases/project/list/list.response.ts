import { withBaseResponse } from '@/interfaces/common.interface';
import { Project } from '@/schemas/project.schema';

export class GetProjectsResponse extends withBaseResponse(Project, {
  isArray: true,
}) {}
