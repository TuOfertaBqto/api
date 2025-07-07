import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDTO, UpdateProductDTO } from './dto/product.dto';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    private readonly categoryService: CategoryService,
  ) {}

  async create(data: CreateProductDTO): Promise<Product> {
    const category = await this.categoryService.findOne(data.categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepo.create({ ...data, categoryId: category });
    return this.productRepo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({ relations: ['categoryId'] });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    const updatedData = {
      ...data,
      categoryId: data.categoryId ? { id: data.categoryId } : undefined,
    };

    await this.productRepo.update(id, updatedData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productRepo.softDelete(id);
  }
}
