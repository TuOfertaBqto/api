import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Repository } from 'typeorm';
import { CreateInventoryDTO, UpdateInventoryDTO } from '../dto/inventory.dto';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,

    private readonly productService: ProductService,
  ) {}

  async findAll(): Promise<Inventory[]> {
    return this.inventoryRepo.find({ relations: ['product'] });
  }

  async findOne(id: string): Promise<Inventory> {
    const item = await this.inventoryRepo.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!item) throw new NotFoundException(`Inventory #${id} not found`);
    return item;
  }

  async getStockByProduct(productId: string): Promise<number> {
    const record = await this.inventoryRepo.findOne({
      where: {
        product: { id: productId },
      },
      relations: ['product'],
    });

    return record?.stockQuantity ?? 0;
  }

  async create(dto: CreateInventoryDTO): Promise<Inventory> {
    const product = await this.productService.findOne(dto.productId);

    const item = this.inventoryRepo.create({
      ...dto,
      product,
    });

    return this.inventoryRepo.save(item);
  }

  async update(id: string, dto: UpdateInventoryDTO): Promise<Inventory> {
    await this.inventoryRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.inventoryRepo.softDelete(id);
  }
}
