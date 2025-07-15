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
import { ContractService } from '../services/contract.service';

@Controller('contract-payment')
export class ContractPaymentController {
  constructor(
    private readonly service: ContractPaymentService,
    private readonly contractService: ContractService,
  ) {}

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

  @Get('contract/:contractId')
  async findByContract(@Param('contractId') contractId: string) {
    return this.service.findByContract(contractId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContractPaymentDTO) {
    const payment = await this.service.findOne(id);

    if (
      typeof dto.amountPaid === 'number' &&
      payment.debt !== null &&
      payment.debt !== undefined
    ) {
      const currentDebt = parseFloat(payment.debt.toString());
      dto.debt = Math.max(currentDebt - dto.amountPaid, 0);
    }

    const updated = await this.service.update(payment, dto);

    if (updated.debt > 0) {
      await this.service.passDebtToNextInstallment(payment, updated.debt);
    } else if (updated.debt === 0) {
      await this.service.markAllRemainingAsPaid(updated.contract.id);
      await this.contractService.update(payment.contract.id, {
        endDate: new Date(),
      });
    }

    return updated;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
