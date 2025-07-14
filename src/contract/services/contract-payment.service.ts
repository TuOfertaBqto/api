import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractPayment } from '../entities/contract-payment.entity';
import { Repository } from 'typeorm';
import { ContractService } from './contract.service';
import {
  CreateContractPaymentDTO,
  UpdateContractPaymentDTO,
} from '../dto/contract-payment.dto';

@Injectable()
export class ContractPaymentService {
  constructor(
    @InjectRepository(ContractPayment)
    private readonly repo: Repository<ContractPayment>,
    private readonly contractService: ContractService,
  ) {}

  async create(dto: CreateContractPaymentDTO): Promise<ContractPayment> {
    const contract = await this.contractService.findOne(dto.contractId);

    const payment = this.repo.create({
      ...dto,
      contract,
    });

    return this.repo.save(payment);
  }

  async findAll(): Promise<ContractPayment[]> {
    return this.repo.find({ relations: ['contract'] });
  }

  async findOne(id: string): Promise<ContractPayment> {
    const payment = await this.repo.findOne({
      where: { id },
      relations: ['contract'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(
    id: string,
    dto: UpdateContractPaymentDTO,
  ): Promise<ContractPayment> {
    const payment = await this.findOne(id);
    if (!dto.contractId) {
      throw new NotFoundException(
        'contractId is required for updating payment',
      );
    }
    const contract = await this.contractService.findOne(dto.contractId);

    Object.assign(payment, { ...dto, contract });

    return this.repo.save(payment);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
