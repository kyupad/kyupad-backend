import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateCollectionItem {
  @ApiProperty({
    description: 'Name of nft collection',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Address of nft collection',
  })
  @IsNotEmpty()
  address: string;
}

class CreateCollectionsInput {
  @ApiProperty({
    description: 'List create collection',
    isArray: true,
    type: CreateCollectionItem,
  })
  @IsArray()
  @ValidateNested()
  @Type(() => CreateCollectionItem)
  collections: CreateCollectionItem[];
}

export { CreateCollectionsInput, CreateCollectionItem };
