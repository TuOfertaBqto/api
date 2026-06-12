import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductDetails } from './entities/product-details.entity';
import { Repository } from 'typeorm';
import { ProductDetailsDTO } from './dto/product-details.dto';

@Injectable()
export class ProductDetailsService {
  constructor(
    @InjectRepository(ProductDetails)
    private readonly productDetailsRepo: Repository<ProductDetails>,
  ) {}

  async create(dto: ProductDetailsDTO[]): Promise<ProductDetails[]> {
    return this.productDetailsRepo.save(dto);
  }
}
