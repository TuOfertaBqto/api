import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ContractProductService } from '../services/contract-product.service';
import {
  BulkUpdateContractProductDTO,
  CreateContractProductDTO,
  UpdateContractProductDTO,
} from '../dto/contract-product.dto';

@Controller('contract-product')
export class ContractProductController {
  constructor(private readonly service: ContractProductService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('to-dispatch/:productId')
  async getToDispatchQuantity(@Param('productId') productId: string) {
    const total = await this.service.getToDispatchQuantity(productId);
    return { toDispatchQuantity: total };
  }

  @Post()
  create(@Body() dto: CreateContractProductDTO[]) {
    return this.service.create(dto);
  }

  @Patch()
  async updateMany(@Body() dtos: BulkUpdateContractProductDTO[]) {
    return this.service.updateMany(dtos);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractProductDTO) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
