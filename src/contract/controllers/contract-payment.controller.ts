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
  CreateListContractPaymentDTO,
  UpdateContractPaymentDTO,
} from '../dto/contract-payment.dto';
import {
  generatePayments,
  getNextSaturday,
} from 'src/utils/create-contract-payment';

@Controller('contract-payment')
export class ContractPaymentController {
  constructor(private readonly service: ContractPaymentService) {}

  @Post()
  create(@Body() dto: CreateListContractPaymentDTO) {
    const firstDueDate = getNextSaturday(dto.startContract);
    const payments = generatePayments(
      dto.contractId,
      dto.totalPriceContract,
      dto.installmentAmountContract,
      dto.agreementContract,
      firstDueDate,
    );

    return this.service.createMany(payments);
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
  async update(@Param('id') id: string, @Body() dto: UpdateContractPaymentDTO) {
    const payment = await this.service.findOne(id);
    if (
      typeof dto.amountPaid === 'number' &&
      typeof payment.debt === 'number'
    ) {
      dto.debt = Math.max(payment.debt - dto.amountPaid, 0);
    }

    const updated = await this.service.update(payment, dto);

    if (updated.debt > 0) {
      await this.service.passDebtToNextInstallment(payment, updated.debt);
    }

    return updated;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
