import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  InventoryMovement,
  MovementType,
} from './entities/inventory-movement.entity';
import { Repository } from 'typeorm';
import { CreateInventoryMovementDTO } from './dto/inventory-movement.dto';
import { InventoryService } from './inventory.service';

@Injectable()
export class InventoryMovementService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly movementRepo: Repository<InventoryMovement>,

    private readonly inventoryService: InventoryService,
  ) {}

  async create(dto: CreateInventoryMovementDTO): Promise<InventoryMovement> {
    const inventory = await this.inventoryService.findOne(dto.inventoryId);

    if (dto.type === MovementType.IN) {
      inventory.stockQuantity += dto.quantity;
    } else {
      inventory.stockQuantity -= dto.quantity;
      if (inventory.stockQuantity < 0)
        throw new NotFoundException('Insufficient inventory stock');
    }

    await this.inventoryService.update(inventory.id, {
      stockQuantity: inventory.stockQuantity,
    });

    const movement = this.movementRepo.create({
      ...dto,
      inventory,
    });

    return this.movementRepo.save(movement);
  }

  async findAll(): Promise<InventoryMovement[]> {
    return this.movementRepo.find({ relations: ['inventory'] });
  }

  async findOne(id: string): Promise<InventoryMovement> {
    const movement = await this.movementRepo.findOne({
      where: { id },
      relations: ['inventory'],
    });

    if (!movement) throw new NotFoundException(`Movement #${id} not found`);
    return movement;
  }
}
