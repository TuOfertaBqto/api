import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractPayment } from '../entities/contract-payment.entity';
import { Brackets, Repository } from 'typeorm';
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

  async createMany(
    data: CreateContractPaymentDTO[],
  ): Promise<ContractPayment[]> {
    const payments = this.repo.create(data);
    return this.repo.save(payments);
  }

  async findAll(): Promise<ContractPayment[]> {
    const subQuery = this.repo
      .createQueryBuilder('sub_cp')
      .select('MIN(sub_cp.due_date)', 'minDate')
      .where('sub_cp.contract_id = cp.contract_id')
      .andWhere('sub_cp.paid_at IS NULL')
      .andWhere('sub_cp.due_date >= CURRENT_DATE');

    return this.repo
      .createQueryBuilder('cp')
      .innerJoinAndSelect('cp.contract', 'contract')
      .where(
        new Brackets((qb) => {
          qb.where('cp.paid_at IS NULL').andWhere(
            `cp.due_date = (${subQuery.getQuery()})`,
          );
        }),
      )
      .orWhere(
        new Brackets((qb) => {
          qb.where('cp.paid_at IS NULL').andWhere('cp.due_date < CURRENT_DATE');
        }),
      )
      .orderBy('cp.due_date', 'ASC')
      .getMany();
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
    if (!dto.contract?.id) {
      throw new NotFoundException(
        'contractId is required for updating payment',
      );
    }
    const contract = await this.contractService.findOne(dto.contract.id);

    Object.assign(payment, { ...dto, contract });

    return this.repo.save(payment);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
