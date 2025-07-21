import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InventoryMovement } from '../entities/inventory-movement.entity';
import { Repository } from 'typeorm';
import { CreateInventoryMovementDTO } from '../dto/inventory-movement.dto';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class InventoryMovementService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly movementRepo: Repository<InventoryMovement>,

    private readonly productService: ProductService,
  ) {}

  async create(dto: CreateInventoryMovementDTO): Promise<InventoryMovement> {
    const product = await this.productService.findOne(dto.productId);

    const movement = this.movementRepo.create({
      ...dto,
      product,
    });

    return this.movementRepo.save(movement);
  }

  async findAll(): Promise<InventoryMovement[]> {
    return this.movementRepo.find({ relations: ['product'] });
  }

  async findOne(id: string): Promise<InventoryMovement> {
    const movement = await this.movementRepo.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!movement) throw new NotFoundException(`Movement #${id} not found`);
    return movement;
  }
}
