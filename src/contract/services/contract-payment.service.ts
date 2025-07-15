import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractPayment } from '../entities/contract-payment.entity';
import { Brackets, IsNull, MoreThan, Repository } from 'typeorm';
import { ContractService } from './contract.service';
import {
  CreateContractPaymentDTO,
  UpdateContractPaymentDTO,
} from '../dto/contract-payment.dto';
import { Agreement } from '../entities/contract.entity';

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

  async findByContract(contractId: string): Promise<ContractPayment[]> {
    return this.repo.find({
      where: { contract: { id: contractId } },
      order: { dueDate: 'ASC' },
    });
  }

  async passDebtToNextInstallment(
    currentPayment: ContractPayment,
    debt: number,
  ): Promise<void> {
    const nextPayment = await this.repo.findOne({
      where: {
        contract: { id: currentPayment.contract.id },
        paidAt: IsNull(),
        dueDate: MoreThan(currentPayment.dueDate),
      },
      order: { dueDate: 'ASC' },
    });

    if (nextPayment) {
      nextPayment.debt = (nextPayment.debt ?? 0) + debt;
      await this.repo.save(nextPayment);
    } else {
      const contract = await this.contractService.findOne(
        currentPayment.contract.id,
      );

      const intervalDays = contract.agreement === Agreement.WEEKLY ? 7 : 14;

      const newDueDate = new Date(currentPayment.dueDate);
      newDueDate.setDate(newDueDate.getDate() + intervalDays);

      const newPayment = this.repo.create({
        contract: { id: contract.id },
        dueDate: newDueDate,
        debt,
      });

      await this.repo.save(newPayment);
    }
  }

  async markAllRemainingAsPaid(contractId: string): Promise<void> {
    const remainingPayments = await this.repo.find({
      where: {
        contract: { id: contractId },
        paidAt: IsNull(),
      },
    });

    const now = new Date();

    for (const payment of remainingPayments) {
      payment.paidAt = now;
      payment.amountPaid = payment.amountPaid ?? 0;
      payment.debt = 0;
    }

    await this.repo.save(remainingPayments);
  }

  async update(
    payment: ContractPayment,
    dto: UpdateContractPaymentDTO,
  ): Promise<ContractPayment> {
    if (dto.contract?.id) {
      const contract = await this.contractService.findOne(dto.contract.id);
      payment.contract = contract;
    }

    Object.assign(payment, { ...dto });

    return this.repo.save(payment);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
