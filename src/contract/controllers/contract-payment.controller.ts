import {
  BadRequestException,
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
    if (!dto.amountPaid || dto.amountPaid <= 0) {
      throw new BadRequestException('El monto pagado debe ser mayor a 0');
    }
    const payment = await this.service.findOne(id);

    let paymentId = payment.id;
    let remainingAmount =
      parseFloat(payment.amountPaid?.toString() ?? 0) + dto.amountPaid;
    const installmentAmount = payment.contract.installmentAmount;

    while (remainingAmount > 0) {
      const installment = await this.service.findOne(paymentId);
      const amountToPay = Math.min(installmentAmount, remainingAmount); // posiblemebte luego poner el monto que se debe

      const newDebt =
        installment.debt -
        amountToPay +
        parseFloat(payment.amountPaid?.toString() ?? 0);

      await this.service.update(installment, {
        amountPaid: amountToPay,
        debt: newDebt,
        paymentMethod: dto.paymentMethod,
        paidAt:
          newDebt === 0 || amountToPay === installmentAmount
            ? dto.paidAt
            : undefined,
      });
      remainingAmount -= amountToPay;

      if (newDebt > 0) {
        if (amountToPay === installmentAmount) {
          const next = await this.service.passDebtToNextInstallment(
            installment,
            newDebt,
          );
          paymentId = next.id;
        }
      } else {
        await this.contractService.update(payment.contract.id, {
          endDate: new Date(),
        });
      }
    }
    return { message: 'Pago procesado exitosamente' };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
