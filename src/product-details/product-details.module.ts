import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductDetails } from 'src/product-details/entities/product-details.entity';
import { ProductDetailsController } from './product-details.controller';
import { ProductDetailsService } from './product-details.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductDetails])],
  controllers: [ProductDetailsController],
  providers: [ProductDetailsService],
  exports: [ProductDetailsService],
})
export class ProductDetailsModule {}
