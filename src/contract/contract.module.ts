import { Module } from '@nestjs/common';
import { ContractService } from './services/contract.service';
import { ContractController } from './controllers/contract.controller';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract]), UserModule],

  providers: [ContractService],
  controllers: [ContractController],
})
export class ContractModule {}
