import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@usecases/admin/auth/auth.guard';
import { FungibleTokenResponse } from '@usecases/admin/fungible/fungible.response';
import { FungibleService } from '@/services/fungible/fungible.service';
import { CreateFungibleTokensInput } from '@usecases/admin/fungible/fungible.input';
import { FungibleToken } from '@schemas/fungible_tokens.schema';
import { DefaultResponse } from '@/interfaces/common.interface';

@ApiTags('admin')
@Controller()
export class FungibleController {
  constructor(private readonly fungibleService: FungibleService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiOkResponse({ type: FungibleTokenResponse })
  async fungibleTokens(): Promise<FungibleTokenResponse> {
    const tokens = await this.fungibleService.getAllFungibleToken();
    return {
      statusCode: 200,
      data: tokens,
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiOkResponse({ type: DefaultResponse })
  async createFungibleToken(
    @Body() createFungibleTokenInput: CreateFungibleTokensInput,
  ): Promise<DefaultResponse> {
    const input: FungibleToken[] = createFungibleTokenInput.tokens.map((ft) => {
      return {
        ...ft,
        created_by: 'ADMIN',
      };
    });
    await this.fungibleService.createFungibleToken(input);
    return {
      statusCode: 200,
      data: { status: 'SUCCESS' },
    };
  }
}
