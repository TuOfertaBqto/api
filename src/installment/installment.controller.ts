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
  CreateListInstallmentDTO,
  UpdateManyInstallmentDTO,
} from './dto/installment.dto';
import { generateInstallments } from 'src/utils/create-contract-payment';
import { ValidatedJwt } from 'src/auth/decorators/validated-jwt.decorator';
import { JwtPayloadDTO } from 'src/auth/dto/jwt.dto';
import { UserRole } from 'src/user/entities/user.entity';
import { InstallmentPaymentService } from './installment-payment.service';
import { PaymentService } from 'src/payment/services/payment.service';
import { PaymentAccountService } from 'src/payment/services/payment-account.service';

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
  updateMany(
    @Body(
      new ParseArrayPipe({
        items: UpdateManyInstallmentDTO,
        whitelist: true,
      }),
    )
    installments: UpdateManyInstallmentDTO[],
  ) {
    return this.service.updateMany(installments);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const ipByInstallment = await this.ipService.findByInstallmentId(id);

    const paymentIds = ipByInstallment.map((ip) => ip.payment.id);

    if (paymentIds.length > 0) {
      const ipByPayments = await this.ipService.findByPaymentIds(paymentIds);

      const installmentToClear = ipByPayments
        .map((ip) => ip.installment.id)
        .filter((instId) => instId !== id)
        .map((instId) => ({
          id: instId,
          debt: null,
          paidAt: null,
        }));

      if (installmentToClear.length > 0) {
        await this.service.updateMany(installmentToClear);
      }
      await this.pAccountService.deleteByPaymentIds(paymentIds);

      await this.paymentService.removeMany(paymentIds);

      await this.ipService.deleteByPaymentIds(paymentIds);
    }

    await this.service.remove(id);

    if (paymentIds.length > 0) {
      const installments = await this.service.findByContract(
        ipByInstallment[0].installment.contract.id,
      );

      const discount = await this.paymentService.findDiscountByContractId(
        ipByInstallment[0].installment.contract.id,
      );

      const totalDiscount = discount.reduce(
        (acc, d) => acc + Number(d.amount),
        0,
      );

      let currentBalance = installments[0].contract.totalPrice - totalDiscount;
      let stopCalculating = false;

      const installmentDebits = installments.map((inst) => {
        if (stopCalculating) {
          return { id: inst.id, debt: null };
        }
        const isPaid = inst.paidAt !== null;
        if (isPaid) {
          // Si está pagada, restamos el monto total de la cuota y seguimos
          currentBalance -= Number(inst.installmentAmount);
          return {
            id: inst.id,
            debt: Number(currentBalance.toFixed(2)),
          };
        } else {
          // Es la PRIMERA cuota no pagada: calculamos abonos, restamos y ACTIVAMOS el stop
          const totalAbonado = inst.installmentPayments.reduce(
            (sum, ip) => sum + Number(ip.amount),
            0,
          );

          currentBalance -= totalAbonado;
          stopCalculating = true; // Esto hará que la siguiente iteración entre en el primer 'if'

          return {
            id: inst.id,
            debt: Number(currentBalance.toFixed(2)),
          };
        }
      });

      await this.service.updateMany(installmentDebits);
    }
  }
}
