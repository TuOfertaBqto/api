import { Body, Controller, Post } from '@nestjs/common';
import { ProductDetailsService } from './product-details.service';
import { ProductDetails } from './entities/product-details.entity';
import { CreateProductDetailsDTO } from './dto/product-details.dto';

@Controller('product-details')
export class ProductDetailsController {
  constructor(private readonly service: ProductDetailsService) {}

  @Post()
  async create(
    @Body() dto: CreateProductDetailsDTO,
  ): Promise<ProductDetails[]> {
    return this.service.create(dto.items);
  }
}
