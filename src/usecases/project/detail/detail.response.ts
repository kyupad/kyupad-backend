import { withBaseResponse } from '@/interfaces/common.interface';
import { Project } from '@/schemas/project.schema';
import { ApiProperty } from '@nestjs/swagger';

class DetailProjectResponse {
  @ApiProperty()
  is_applied: boolean;
  @ApiProperty()
  detail: Project;
}

export class GetProjectDetailResponse extends withBaseResponse(
  DetailProjectResponse,
  {},
) {}

export interface IApplyProjectResponse {}
