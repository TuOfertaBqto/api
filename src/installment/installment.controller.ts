import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InstallmentService } from './installment.service';
import { ContractService } from 'src/contract/services/contract.service';
import {
  CreateListInstallmentDTO,
  UpdateInstallmentDTO,
} from './dto/installment.dto';
import {
  generateInstallments,
  getNextSaturday,
} from 'src/utils/create-contract-payment';
import { ValidatedJwt } from 'src/auth/decorators/validated-jwt.decorator';
import { JwtPayloadDTO } from 'src/auth/dto/jwt.dto';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('installment')
export class InstallmentController {
  constructor(
    private readonly service: InstallmentService,
    private readonly contractService: ContractService,
  ) {}

  @Post()
  create(@Body() dto: CreateListInstallmentDTO) {
    const firstDueDate = getNextSaturday(dto.startContract);
    const payments = generateInstallments(
      dto.contractId,
      dto.products,
      dto.agreementContract,
      firstDueDate,
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

    console.log({ totalInstallments, overdueInstallments });

    return totalInstallments * 0.3 > overdueInstallments;
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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInstallmentDTO) {
    if (!dto.amountPaid || dto.amountPaid <= 0) {
      throw new BadRequestException('El monto pagado debe ser mayor a 0');
    }
    const payment = await this.service.findOne(id);

    let paymentId = payment.id;
    let remainingAmount = //40
      parseFloat(payment.amountPaid?.toString() ?? 0) + dto.amountPaid;

    while (remainingAmount > 0) {
      const installment = await this.service.findOne(paymentId);
      const installmentAmount = installment.installmentAmount; //20
      const amountToPay = Math.min(installmentAmount, remainingAmount); // posiblemebte luego poner el monto que se debe

      const newDebt =
        installment.debt -
        amountToPay +
        parseFloat(installment.amountPaid?.toString() ?? 0);

      await this.service.update(installment, {
        amountPaid: amountToPay,
        debt: newDebt,
        paymentMethod: dto.paymentMethod,
        referenceNumber: dto.referenceNumber,
        owner: dto.owner,
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
