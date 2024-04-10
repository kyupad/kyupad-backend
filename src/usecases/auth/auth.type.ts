import { withBaseResponse } from '@/interfaces/common.interface';
import { ApiProperty } from '@nestjs/swagger';

class SigninDataResult {
  @ApiProperty({ default: 'dev.kyupad.xyz' })
  domain: string;
  @ApiProperty({
    default:
      'Clicking Sign or Approve only means you have proved this wallet is owned by you. This request will not trigger any blockchain transaction or cost any gas fee.',
  })
  statement: string;
  @ApiProperty({ default: '1' })
  version: string;
  @ApiProperty({ default: '67f4b4a0e1aab6ab41cd90efba2f5e14' })
  nonce: string;
  @ApiProperty({ default: 'testnet' })
  chainId: string;
  @ApiProperty({ default: '2024-04-09T08:38:41.318Z' })
  issuedAt: string;
}

class SigninDataResponse extends withBaseResponse(SigninDataResult) {}

class SigninDataOutput {
  @ApiProperty({
    default: { publicKey: 'CY92ruXbHmeaNiGqaZ9mXnXFPTjgfq2pHDuoM5VgWY1V' },
  })
  account: {
    publicKey: string;
  };
  @ApiProperty()
  signature: string;
  @ApiProperty()
  signedMessage: string;
  @ApiProperty({ default: 'ed25519' })
  signatureType: 'ed25519';
}

class VerifySIWSBody {
  @ApiProperty()
  input: SigninDataResult;
  @ApiProperty()
  output: SigninDataOutput;
}

class VerifySIWSResult {
  @ApiProperty({
    default:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhZG1pbiIsInBhc3N3b3JkIjoiYWRtaW4iLCJpYXQiOjE3MTI2MTI3MzgsImV4cCI6MTcxMjYxMzAzOH0.yocy5s_aCHVAL9DtVrH5XBnf5ERhlGbUOLQeZ7R-CqE',
  })
  access_token: string;
  @ApiProperty({
    default:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhZG1pbiIsInBhc3N3b3JkIjoiYWRtaW4iLCJpYXQiOjE3MTI2MTI3MzgsImV4cCI6MTcxMzIxNzUzOH0.TMwBLIjQs9db9GbKrC2M9CPlhVuety9Os_MivHnmlB4',
  })
  refresh_token: string;
}

class VerifySIWSResponse extends withBaseResponse(VerifySIWSResult) {}

class RefreshBody {
  @ApiProperty({
    default:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhZG1pbiIsInBhc3N3b3JkIjoiYWRtaW4iLCJpYXQiOjE3MTI2MTI3MzgsImV4cCI6MTcxMzIxNzUzOH0.TMwBLIjQs9db9GbKrC2M9CPlhVuety9Os_MivHnmlB4',
  })
  refresh_token: string;
}

export {
  SigninDataResponse,
  SigninDataResult,
  VerifySIWSBody,
  VerifySIWSResponse,
  RefreshBody,
};
