import { withBaseResponse } from '@/interfaces/common.interface';
import { ApiProperty } from '@nestjs/swagger';

class SigninDataResult {
  @ApiProperty()
  message: string;
}

class SigninDataParams {
  publicKey: string;
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

class VerifyBody {
  @ApiProperty()
  message: string;
  @ApiProperty()
  signature: string;
  @ApiProperty()
  publicKey: string;
  @ApiProperty({ type: 'string', enum: ['solana', 'ethereum', 'bsc'] })
  network: 'solana' | 'ethereum' | 'bsc';
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
  VerifyBody,
  SigninDataParams,
};
