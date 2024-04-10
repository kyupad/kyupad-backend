import { withBaseResponse } from '@/interfaces/common.interface';
import { Project } from '@/schemas/project.schema';

class ListProjectResponse extends withBaseResponse(Project) {}

export { ListProjectResponse };
