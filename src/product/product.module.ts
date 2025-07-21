import { forwardRef, Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CategoryModule } from 'src/category/category.module';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoryModule,
    forwardRef(() => InventoryModule),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
