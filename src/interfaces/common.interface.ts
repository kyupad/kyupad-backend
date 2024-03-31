import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { mixin } from '@nestjs/common';

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
      required: true,
      type: Base,
      ...options,
    })
    @Type(() => Base)
    data: InstanceType<TBase>;

    @ApiProperty({ type: String, required: false })
    error?: string;
  }

  return mixin(ResponseBase);
}
