import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import {
  RefreshBody,
  SigninDataParams,
  SigninDataResponse,
  VerifyBody,
  VerifySIWSResponse,
} from './auth.type';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import bs58 from 'bs58';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/services/user/user.service';
import { isEmpty } from '@/helpers';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

@Controller()
@ApiTags('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  private readonly WEB_URL: string;
  private readonly CHAIN_ID: string;
  private readonly JWT_REFRESH_TOKEN_SECRET: string;
  private readonly JWT_ACCESS_TOKEN_SECRET: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {
    this.WEB_URL = this.configService.get<string>('WEB_URL')!;
    this.CHAIN_ID = this.configService.get<string>('CHAIN_ID')!;
    this.JWT_REFRESH_TOKEN_SECRET = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    )!;
    this.JWT_ACCESS_TOKEN_SECRET = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_SECRET',
    )!;
  }

  @Get('signin-data')
  @ApiOperation({ summary: 'Get signin data payload' })
  @ApiOkResponse({ type: SigninDataResponse })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiParam({ name: 'publicKey', required: true, type: 'string' })
  signinData(@Query() params: SigninDataParams): SigninDataResponse {
    if (!params?.publicKey) {
      throw new BadRequestException('public key is required');
    }

    const now: Date = new Date();
    const currentUrl = new URL(this.WEB_URL);
    const domain = currentUrl.host;
    const nonce = crypto.randomBytes(16).toString('hex');

    const currentDateTime = now.toISOString();

    const signInData = `${domain} wants you to signin with your account: ${params.publicKey}.

Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.

Version: 1
Chain ID: ${this.CHAIN_ID}
Nonce: ${nonce}
Issued At: ${currentDateTime}`;

    return { data: { message: signInData }, statusCode: 200 };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ type: VerifySIWSResponse })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async refresh(@Body() body: RefreshBody): Promise<VerifySIWSResponse> {
    if (!body?.refresh_token) {
      throw new UnauthorizedException('refresh_token is required');
    }

    try {
      await this.jwtService.verifyAsync(body.refresh_token, {
        secret: this.JWT_REFRESH_TOKEN_SECRET,
      });
    } catch (e) {
      this.logger.error(e.message);
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const decoded = await this.jwtService.decode(body.refresh_token);
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
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('verify')
  @ApiBody({ type: VerifyBody })
  @ApiCreatedResponse({ type: VerifySIWSResponse })
  @ApiOperation({ summary: 'Verify Sign In' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiConflictResponse({ description: 'Conflict' })
  async verifySignIn(@Body() body: VerifyBody): Promise<VerifySIWSResponse> {
    if (isEmpty(body)) {
      throw new UnauthorizedException('signin input is required');
    }

    if (!body?.publicKey) {
      throw new UnauthorizedException('public key is required');
    }

    if (!body?.signature) {
      throw new UnauthorizedException('signature is required');
    }

    if (!body?.message) {
      throw new UnauthorizedException('message is required');
    }

    if (!body?.network) {
      throw new UnauthorizedException('network is required');
    }

    const encodedMessage = new TextEncoder().encode(body.message);

    const verified = nacl.sign.detached.verify(
      encodedMessage,
      bs58.decode(body.signature),
      new Uint8Array(new PublicKey(body.publicKey).toBuffer()),
    );

    if (!verified) {
      throw new UnauthorizedException('Sign In verification failed!');
    }

    const payload = { sub: body.publicKey };

    try {
      await this.userService.upsert({
        id: `${body.network}:${body.publicKey}`,
      });
    } catch (e) {
      this.logger.error(e.message);
      throw new ConflictException('Failed to register user');
    }

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
      statusCode: HttpStatus.CREATED,
    };
  }
}
