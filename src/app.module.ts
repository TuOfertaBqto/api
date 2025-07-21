import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ContractModule } from './contract/contract.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    ContractModule,
    CategoryModule,
    ProductModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
