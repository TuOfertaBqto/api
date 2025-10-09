import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Installment } from './entities/installment.entity';
import { InstallmentService } from './installment.service';
import { InstallmentController } from './installment.controller';
import { Contract } from 'src/contract/entities/contract.entity';
import { ContractModule } from 'src/contract/contract.module';
import { InstallmentPayment } from './entities/installment-payment.entity';
import { InstallmentPaymentService } from './installment-payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Installment, InstallmentPayment, Contract]),
    forwardRef(() => ContractModule),
  ],
  providers: [InstallmentService, InstallmentPaymentService],
  controllers: [InstallmentController],
  exports: [InstallmentService, InstallmentPaymentService],
})
export class InstallmentModule {}
