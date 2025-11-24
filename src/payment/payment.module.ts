import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { InstallmentModule } from 'src/installment/installment.module';
import { ContractModule } from 'src/contract/contract.module';
import { PaymentAccount } from './entities/payment-account.entity';
import { PaymentAccountService } from './services/payment-account.service';
import { AccountModule } from 'src/account/account.module';
import { PaymentAccountController } from './controllers/payment-account.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentAccount]),
    InstallmentModule,
    ContractModule,
    AccountModule,
  ],
  providers: [PaymentService, PaymentAccountService],
  controllers: [PaymentController, PaymentAccountController],
})
export class PaymentModule {}
