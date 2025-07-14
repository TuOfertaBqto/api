import { Module } from '@nestjs/common';
import { ContractService } from './services/contract.service';
import { ContractController } from './controllers/contract.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { ContractProduct } from './entities/contract-product.entity';
import { ContractProductController } from './controllers/contract-product.controller';
import { ContractProductService } from './services/contract-product.service';
import { ContractPayment } from './entities/contract-payment.entity';
import { ContractPaymentService } from './services/contract-payment.service';
import { ContractPaymentController } from './controllers/contract-payment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, ContractProduct, ContractPayment]),
    UserModule,
  ],
  providers: [ContractService, ContractProductService, ContractPaymentService],
  controllers: [
    ContractController,
    ContractProductController,
    ContractPaymentController,
  ],
})
export class ContractModule {}
