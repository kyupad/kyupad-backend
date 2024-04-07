import { Module } from '@nestjs/common';
import { FungibleServiceModule } from '@/services/fungible/fungible.module';
import { FungibleController } from '@usecases/admin/fungible/fungible.controller';

@Module({
  imports: [FungibleServiceModule],
  controllers: [FungibleController],
})
export class FungibleModule {}
