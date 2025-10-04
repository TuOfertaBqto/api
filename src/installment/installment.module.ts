import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Installment } from './entities/installment.entity';
import { InstallmentService } from './installment.service';
import { InstallmentController } from './installment.controller';
import { Contract } from 'src/contract/entities/contract.entity';
import { ContractModule } from 'src/contract/contract.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Installment, Contract]),
    forwardRef(() => ContractModule),
  ],
  providers: [InstallmentService],
  controllers: [InstallmentController],
  exports: [InstallmentService],
})
export class InstallmentModule {}
