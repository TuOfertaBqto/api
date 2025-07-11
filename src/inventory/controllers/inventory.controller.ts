import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDTO, UpdateInventoryDTO } from '../dto/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Get('stock/:productId')
  async getStock(@Param('productId') productId: string) {
    const stock = await this.inventoryService.getStockByProduct(productId);
    return { stock };
  }

  @Post()
  create(@Body() dto: CreateInventoryDTO) {
    return this.inventoryService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInventoryDTO) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
