import { Module } from '@nestjs/common';
import { ContractService } from './services/contract.service';
import { ContractController } from './controllers/contract.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { ContractProduct } from './entities/contract-product.entity';
import { ContractProductController } from './controllers/contract-product.controller';
import { ContractProductService } from './services/contract-product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, ContractProduct]), UserModule],
  providers: [ContractService, ContractProductService],
  controllers: [ContractController, ContractProductController],
})
export class ContractModule {}
