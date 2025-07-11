import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InventoryMovementService } from '../services/inventory-movement.service';
import { CreateInventoryMovementDTO } from '../dto/inventory-movement.dto';

@Controller('inventory-movement')
export class InventoryMovementController {
  constructor(private readonly service: InventoryMovementService) {}

  @Post()
  create(@Body() dto: CreateInventoryMovementDTO) {
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
