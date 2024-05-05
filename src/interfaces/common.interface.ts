import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { mixin } from '@nestjs/common';
import { EDefultResponseStatus } from '@/enums';

type Constructor<T = NonNullable<unknown>> = new (...args: any[]) => T;

export function withBaseResponse<TBase extends Constructor>(
  Base: TBase,
  options?: ApiPropertyOptions | undefined,
) {
  class ResponseBase {
    @ApiProperty({ type: Number, required: true })
    statusCode: number;
    @ApiProperty({ type: String, required: false })
    message?: string;

    @ApiProperty({
      required: false,
      type: Base,
      ...options,
    })
    @Type(() => Base)
    data: InstanceType<TBase> | InstanceType<TBase>[] | null;

    @ApiProperty({ type: String, required: false })
    error?: string;
  }

  return mixin(ResponseBase);
}

class DefaultResponseDto {
  @ApiProperty({
    enum: EDefultResponseStatus,
    required: true,
  })
  status: 'SUCCESS';
}

class PaginationResponse {
  @ApiProperty()
  total: number;
  @ApiProperty()
  page: number;
}

class DefaultResponse extends withBaseResponse(DefaultResponseDto, {}) {}

export { DefaultResponse, PaginationResponse };
