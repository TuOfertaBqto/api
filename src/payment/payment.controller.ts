import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDTO, UpdatePaymentDTO } from './dto/payment.dto';
import { InstallmentService } from 'src/installment/installment.service';
import { ContractService } from 'src/contract/services/contract.service';
import { InstallmentPaymentService } from 'src/installment/installment-payment.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly installmentService: InstallmentService,
    private readonly installmentPaymentService: InstallmentPaymentService,
    private readonly contractService: ContractService,
  ) {}

  @Post()
  async create(
    @Query('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: 400 }))
    id: string,
    @Body() data: CreatePaymentDTO,
  ) {
    if (data.amount <= 0) {
      throw new BadRequestException('El monto pagado debe ser mayor a 0');
    }

    const payment = await this.paymentService.create(data);
    let availableAmount = data.amount;
    let installmentId = id;

    while (availableAmount > 0) {
      const installment = await this.installmentService.findOne(installmentId);
      const installmentAmount = installment.installmentAmount;
      const partialPaymentAmount =
        installment.installmentPayments?.reduce(
          (sum, ip) => sum + Number(ip.amount),
          0,
        ) ?? 0;
      const installmentDebt = installmentAmount - partialPaymentAmount;
      const amountToPay = Math.min(installmentDebt, availableAmount);

      const newDebt = installment.debt - amountToPay;

      await this.installmentService.update(installment, {
        debt: newDebt,
        paidAt:
          newDebt === 0 || availableAmount >= installmentDebt
            ? data.paidAt
            : undefined,
      });

      await this.installmentPaymentService.create({
        installment: { id: installment.id },
        payment: { id: payment.id },
        amount: amountToPay,
      });
      availableAmount -= amountToPay;

      if (newDebt > 0) {
        if (availableAmount >= installmentDebt) {
          const next = await this.installmentService.passDebtToNextInstallment(
            installment,
            newDebt,
          );
          installmentId = next.id;
        }
      } else {
        await this.contractService.update(installment.contract.id, {
          endDate: new Date(),
        });
      }
    }

    return payment;
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdatePaymentDTO) {
    return this.paymentService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
}
