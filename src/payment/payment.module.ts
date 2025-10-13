import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { InstallmentModule } from 'src/installment/installment.module';
import { ContractModule } from 'src/contract/contract.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    InstallmentModule,
    ContractModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
