import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { InstallmentService } from './installment.service';
import { CreateListInstallmentDTO } from './dto/installment.dto';
import {
  generateInstallments,
  getNextSaturday,
} from 'src/utils/create-contract-payment';
import { ValidatedJwt } from 'src/auth/decorators/validated-jwt.decorator';
import { JwtPayloadDTO } from 'src/auth/dto/jwt.dto';
import { UserRole } from 'src/user/entities/user.entity';

@Controller('installment')
export class InstallmentController {
  constructor(private readonly service: InstallmentService) {}

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
