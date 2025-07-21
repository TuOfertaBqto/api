import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { InventoryMovementService } from '../services/inventory-movement.service';
import { CreateInventoryMovementDTO } from '../dto/inventory-movement.dto';
import { InventoryService } from '../services/inventory.service';
import { MovementType } from '../entities/inventory-movement.entity';

@Controller('inventory-movement')
export class InventoryMovementController {
  constructor(
    private readonly service: InventoryMovementService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Post()
  async create(@Body() dto: CreateInventoryMovementDTO) {
    const inventory = await this.inventoryService.findOneByProduct(
      dto.productId,
    );

    if (dto.type === MovementType.OUT) {
      if (inventory.stockQuantity < dto.quantity) {
        throw new BadRequestException('insufficient stock');
      }

      inventory.stockQuantity -= dto.quantity;
    } else {
      inventory.stockQuantity += dto.quantity;
    }
    await this.inventoryService.update(inventory.id, {
      stockQuantity: inventory.stockQuantity,
    });
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
