import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { IRefreshResponse } from './refresh.type';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller()
export class RefreshController {
  private readonly JWT_ACCESS_TOKEN_SECRET: string;
  private readonly JWT_REFRESH_TOKEN_SECRET: string;
  private readonly logger = new Logger(RefreshController.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_SECRET = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_SECRET',
    )!;
    this.JWT_REFRESH_TOKEN_SECRET = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    )!;
  }

  @Post()
  async refresh(
    @Body() { refresh_token }: { refresh_token: string },
  ): Promise<IRefreshResponse> {
    if (!refresh_token) {
      throw new HttpException(
        'refresh_token is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      await this.jwtService.verifyAsync(refresh_token, {
        secret: this.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch (e) {
      this.logger.error(e.message);
      throw new HttpException('Bad request!', HttpStatus.UNAUTHORIZED);
    }

    const decoded = await this.jwtService.decode(refresh_token);
    const payload = { sub: decoded.sub };

    return {
      data: {
        access_token: await this.jwtService.signAsync(payload, {
          expiresIn: '5m',
          secret: this.JWT_ACCESS_TOKEN_SECRET,
        }),
        refresh_token: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: this.JWT_REFRESH_TOKEN_SECRET,
        }),
      },
      statusCode: HttpStatus.OK,
    };
  }
}
