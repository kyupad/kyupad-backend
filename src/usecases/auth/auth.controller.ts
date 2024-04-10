import { CHAIN_ID } from '@/constants';
import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import {
  RefreshBody,
  SigninDataResponse,
  SigninDataResult,
  VerifySIWSBody,
  VerifySIWSResponse,
} from './auth.type';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import bs58 from 'bs58';
import { verifySignIn } from '@solana/wallet-standard-util';
import { JwtService } from '@nestjs/jwt';
import { SolanaSignInOutput } from '@solana/wallet-standard-features';
import { UserService } from '@/services/user/user.service';
import { isEmpty } from '@/helpers';

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
  signinData(): SigninDataResponse {
    const now: Date = new Date();
    const currentUrl = new URL(this.WEB_URL);
    const domain = currentUrl.host;
    const nonce = crypto.randomBytes(16).toString('hex');

    // Convert the Date object to a string
    const currentDateTime = now.toISOString();
    const signInData: SigninDataResult = {
      domain,
      statement:
        'Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.',
      version: '1',
      nonce,
      chainId:
        this.CHAIN_ID === CHAIN_ID.Testnet
          ? CHAIN_ID.Testnet
          : CHAIN_ID.Mainnet,
      issuedAt: currentDateTime,
    };

    return { data: signInData, statusCode: 200 };
  }

  @Post('verify-siws')
  @ApiBody({ type: VerifySIWSBody })
  @ApiCreatedResponse({ type: VerifySIWSResponse })
  @ApiOperation({ summary: 'Verify sign in with Solana' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiConflictResponse({ description: 'Conflict' })
  async verifySignInWithSolana(
    @Body() body: VerifySIWSBody,
  ): Promise<VerifySIWSResponse> {
    if (isEmpty(body.input)) {
      throw new UnauthorizedException('signin input is required');
    }

    if (!body.output.account.publicKey) {
      throw new UnauthorizedException('public key is required');
    }

    if (!body.output.signature) {
      throw new UnauthorizedException('signature is required');
    }

    if (!body.output.signedMessage) {
      throw new UnauthorizedException('signed message is required');
    }

    if (!body.output.signatureType) {
      throw new UnauthorizedException('signature type is required');
    }

    if (body.output.signatureType !== 'ed25519') {
      throw new UnauthorizedException('signature type is invalid');
    }

    const decodedOutput: SolanaSignInOutput = {
      account: {
        publicKey: new Uint8Array(
          bs58.decode(body.output.account.publicKey as any),
        ),
      } as any,
      signature: new Uint8Array(bs58.decode(body.output.signature as any)),
      signedMessage: new Uint8Array(
        bs58.decode(body.output.signedMessage as any),
      ),
      signatureType: body.output.signatureType,
    };

    if (!verifySignIn(body.input, decodedOutput)) {
      throw new UnauthorizedException('Sign In verification failed!');
    }

    const payload = { sub: body.output.account.publicKey };

    try {
      await this.userService.upsert({
        _id: body.output.account.publicKey,
      });
    } catch {
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
}
