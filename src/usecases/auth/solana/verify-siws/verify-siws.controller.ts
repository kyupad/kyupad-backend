import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  SolanaSignInInput,
  SolanaSignInOutput,
} from '@solana/wallet-standard-features';
import { IVerifySignInWithSolanaResponse } from './verify-siws.type';
import bs58 from 'bs58';
import { verifySignIn } from '@solana/wallet-standard-util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@/services/user/user.service';

@Controller()
export class VerifySiwsController {
  private logger = new Logger(VerifySiwsController.name);
  private readonly JWT_REFRESH_TOKEN_SECRET: string;
  private readonly JWT_ACCESS_TOKEN_SECRET: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    this.JWT_REFRESH_TOKEN_SECRET = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_SECRET',
    )!;
    this.JWT_ACCESS_TOKEN_SECRET = this.configService.get<string>(
      'JWT_ACCESS_TOKEN_SECRET',
    )!;
  }
  @Post()
  async verifySignInWithSolana(
    @Body('input') input: SolanaSignInInput,
    @Body('output') output: SolanaSignInOutput,
  ): Promise<IVerifySignInWithSolanaResponse> {
    const decodedOutput: SolanaSignInOutput = {
      account: {
        publicKey: new Uint8Array(bs58.decode(output.account.publicKey as any)),
      } as any,
      signature: new Uint8Array(bs58.decode(output.signature as any)),
      signedMessage: new Uint8Array(bs58.decode(output.signedMessage as any)),
      signatureType: output.signatureType,
    };

    if (!verifySignIn(input, decodedOutput)) {
      this.logger.error('Sign In verification failed!');
      throw new HttpException(
        'Sign In verification failed!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { sub: output.account.publicKey };

    await this.userService.upsert({
      _id: output.account.publicKey as unknown as string,
    });

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
      statusCode: 201,
    };
  }
}
