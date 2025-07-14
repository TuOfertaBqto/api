import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ContractPaymentService } from '../services/contract-payment.service';
import {
  CreateContractPaymentDTO,
  UpdateContractPaymentDTO,
} from '../dto/contract-payment.dto';

@Controller('contract-payment')
export class ContractPaymentController {
  constructor(private readonly service: ContractPaymentService) {}

  @Post()
  create(@Body() dto: CreateContractPaymentDTO) {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractPaymentDTO) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
