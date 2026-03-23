import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InstallmentService } from './installment.service';
import {
  ContractRefDTO,
  CreateListInstallmentDTO,
  UpdateManyInstallmentDTO,
} from './dto/installment.dto';
import {
  calculateInstallmentDebts,
  generateInstallments,
  getNextFortnight,
  getNextSaturday,
} from 'src/utils/create-contract-payment';
import { ValidatedJwt } from 'src/auth/decorators/validated-jwt.decorator';
import { JwtPayloadDTO } from 'src/auth/dto/jwt.dto';
import { UserRole } from 'src/user/entities/user.entity';
import { InstallmentPaymentService } from './installment-payment.service';
import { PaymentService } from 'src/payment/services/payment.service';
import { PaymentAccountService } from 'src/payment/services/payment-account.service';
import { Agreement } from 'src/contract/entities/contract.entity';

@Controller('installment')
export class InstallmentController {
  constructor(
    private readonly service: InstallmentService,
    private readonly ipService: InstallmentPaymentService,
    private readonly paymentService: PaymentService,
    private readonly pAccountService: PaymentAccountService,
  ) {}

  @Post()
  create(@Body() dto: CreateListInstallmentDTO) {
    const payments = generateInstallments(
      dto.contractId,
      dto.products,
      dto.agreementContract,
      dto.startContract,
    );

    return this.service.createMany(payments);
  }
  @Post('one')
  async createOne(@Body() dto: ContractRefDTO) {
    const installments = await this.service.findByContract(dto.id);

    if (!installments || installments.length === 0) return;

    const lastInstallment = installments.at(-1);

    if (!lastInstallment) return;

    const extraAmount = Number(lastInstallment.installmentAmount);

    const updated = installments
      .filter((i) => i.debt !== null)
      .map((i) => ({
        id: i.id,
        debt: Number(i.debt) + extraAmount,
      }));

    await this.service.updateMany(updated);

    const nextDate =
      lastInstallment.contract.agreement == Agreement.FIFTEEN_AND_LAST
        ? getNextFortnight(lastInstallment.dueDate)
        : getNextSaturday(
            lastInstallment.dueDate,
            lastInstallment.contract.agreement,
          );

    const newInstallment = {
      contract: { id: dto.id },
      installmentAmount: extraAmount,
      dueDate: nextDate.toISOString(),
    };

    return this.service.createMany([newInstallment]);
  }

  @Get('overdue/customers-by-vendor')
  async getOverdueCustomersByVendor() {
    return this.service.getOverdueCustomersByVendor();
  }

  @Get('payments-summary')
  async getGlobalPaymentsSummary() {
    return this.service.getGlobalPaymentsSummary();
  }

  @Get('vendor/payments-summary')
  async getVendorPaymentsSummary() {
    return this.service.getVendorPaymentsSummary();
  }

  @Get('vendor/can-request')
  async canVendorRequest(
    @ValidatedJwt() payload: JwtPayloadDTO,
  ): Promise<boolean> {
    const totalInstallments = await this.service.getTotalInstallmentsByVendor(
      payload.sub,
    );

    if (totalInstallments === 0) {
      return true;
    }

    const overdueInstallments = await this.service.getTotalOverdueByVendor(
      payload.sub,
    );

    return totalInstallments * 0.3 > overdueInstallments;
  }

  @Get('vendor/:vendorId/collection-effectiveness')
  getVendorEffectiveness(@Param('vendorId') vendorId: string) {
    return this.service.getCollectionEffectivenessByVendor(vendorId);
  }

  @Get('vendor/:vendorId')
  findAllByVendor(@Param('vendorId') vendorId: string) {
    return this.service.findAll(vendorId);
  }

  @Get('overdue/:id/customers-by-vendor')
  async getOverdueCustomersByOneVendor(
    @Param('id') id: string,
    @ValidatedJwt() payload: JwtPayloadDTO,
  ) {
    let vendorId: string;

    if (payload.role === UserRole.MAIN || payload.role === UserRole.ADMIN) {
      vendorId = id;
    } else {
      if (payload.sub !== id) {
        throw new ForbiddenException(
          'No puedes consultar pagos de otro vendedor',
        );
      }
      vendorId = payload.sub;
    }
    return this.service.getOverdueCustomersByOneVendor(vendorId);
  }

  @Get('vendor/:id/payments-summary')
  async getOneVendorPaymentsSummary(
    @Param('id') id: string,
    @ValidatedJwt() payload: JwtPayloadDTO,
  ) {
    let vendorId: string;

    if (payload.role === UserRole.MAIN || payload.role === UserRole.ADMIN) {
      vendorId = id;
    } else {
      if (payload.sub !== id) {
        throw new ForbiddenException(
          'No puedes consultar pagos de otro vendedor',
        );
      }
      vendorId = payload.sub;
    }
    return this.service.getOneVendorPaymentsSummary(vendorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('contract/:contractId')
  async findByContract(@Param('contractId') contractId: string) {
    return this.service.findByContract(contractId);
  }

  @Patch()
  async updateMany(
    @Body(
      new ParseArrayPipe({
        items: UpdateManyInstallmentDTO,
        whitelist: true,
      }),
    )
    installments: UpdateManyInstallmentDTO[],
  ) {
    const update = await this.service.updateMany(installments);
    const contractId = update[0].contract.id;
    const res = await this.service.findByContract(contractId);

    const discount =
      await this.paymentService.findDiscountByContractId(contractId);

    const totalDiscount = discount.reduce(
      (acc, d) => acc + Number(d.amount),
      0,
    );

    const totalContractAmount = installments.reduce(
      (acc, inst) => acc + Number(inst.installmentAmount),
      0,
    );

    let currentBalance = totalContractAmount - totalDiscount;
    let stopCalculating = false;

    const installmentUpdates = res.map((inst) => {
      if (stopCalculating) {
        return {
          id: inst.id,
          debt: null,
          paidAt: null,
        };
      }
      const totalAbonado = inst.installmentPayments.reduce(
        (sum, ip) => sum + Number(ip.amount),
        0,
      );

      const isPaid = totalAbonado == Number(inst.installmentAmount);

      if (isPaid) {
        currentBalance -= Number(inst.installmentAmount);
        return {
          id: inst.id,
          debt: Number(currentBalance.toFixed(2)),
        };
      } else {
        currentBalance -= totalAbonado;
        stopCalculating = true;

        return {
          id: inst.id,
          debt: Number(currentBalance.toFixed(2)),
          paidAt: null,
        };
      }
    });

    await this.service.updateMany(installmentUpdates);

    return res;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const inst = await this.service.findOne(id);
    const ipByInstallment = await this.ipService.findByInstallmentId(id);

    const paymentIds = ipByInstallment.map((ip) => ip.payment.id);

    if (paymentIds.length > 0) {
      //   const ipByPayments = await this.ipService.findByPaymentIds(paymentIds);

      //   const installmentToClear = ipByPayments
      //     .map((ip) => ip.installment.id)
      //     .filter((instId) => instId !== id)
      //     .map((instId) => ({
      //       id: instId,
      //       debt: null,
      //       paidAt: null,
      //     }));

      //   if (installmentToClear.length > 0) {
      //     await this.service.updateMany(installmentToClear);
      //   }
      await this.pAccountService.deleteByPaymentIds(paymentIds);

      await this.paymentService.removeMany(paymentIds);

      await this.ipService.deleteByPaymentIds(paymentIds);
    }

    await this.service.remove(id);

    const installments = await this.service.findByContract(inst.contract.id);

    const discount = await this.paymentService.findDiscountByContractId(
      inst.contract.id,
    );

    const installmentDebits = calculateInstallmentDebts(installments, discount);

    await this.service.updateMany(installmentDebits);
  }
}
