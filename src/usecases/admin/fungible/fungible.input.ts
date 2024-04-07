import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateFungibleTokenItem {
  @ApiProperty({
    description: 'Name of fungible token',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Symbol of fungible token',
  })
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({
    description: 'Icon of fungible token',
  })
  @IsNotEmpty()
  icon: string;

  @ApiProperty({
    description: 'Address of fungible token',
  })
  @IsNotEmpty()
  address: string;
}

class CreateFungibleTokensInput {
  @ApiProperty({
    description: 'List create fungible token',
    isArray: true,
    type: CreateFungibleTokenItem,
  })
  @IsArray()
  @ValidateNested()
  @Type(() => CreateFungibleTokenItem)
  tokens: CreateFungibleTokenItem[];
}

export { CreateFungibleTokensInput, CreateFungibleTokenItem };
