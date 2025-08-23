import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractPayment } from '../entities/contract-payment.entity';
import { Brackets, IsNull, MoreThan, Repository } from 'typeorm';
import { ContractService } from './contract.service';
import {
  CreateContractPaymentDTO,
  UpdateContractPaymentDTO,
  VendorsWithDebtsDTO,
} from '../dto/contract-payment.dto';
import { plainToInstance } from 'class-transformer';
type RawRow = {
  vendorId: string;
  code: string;
  vendorFirstName: string;
  vendorLastName: string;
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  contractId: string;
  contractCode: string;
  overdueInstallments: string;
  overdueAmount: string;
  overdueNumbers: string;
};

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

    const result = await this.repo
      .createQueryBuilder('cp')
      .innerJoinAndSelect('cp.contract', 'contract')
      .leftJoinAndSelect('contract.vendorId', 'vendor')
      .leftJoinAndSelect('contract.customerId', 'customer')
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

    return plainToInstance(ContractPayment, result, {
      excludeExtraneousValues: false,
    });
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
      relations: ['contract'],
      order: { dueDate: 'ASC' },
    });
  }

  async passDebtToNextInstallment(
    currentPayment: ContractPayment,
    debt: number,
  ): Promise<ContractPayment> {
    const nextPayment = await this.repo.findOne({
      where: {
        contract: { id: currentPayment.contract.id },
        paidAt: IsNull(),
        dueDate: MoreThan(currentPayment.dueDate),
      },
      order: { dueDate: 'ASC' },
    });

    if (!nextPayment) throw new NotFoundException(`Payment with not found`);

    nextPayment.debt = (nextPayment.debt ?? 0) + debt;
    return await this.repo.save(nextPayment);
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

  async getOverdueCustomersByVendor(): Promise<VendorsWithDebtsDTO[]> {
    // Subquery A: todas las cuotas numeradas
    const installmentsSubQuery = this.repo
      .createQueryBuilder('cp')
      .select('cp.id', 'paymentId')
      .addSelect('c.id', 'contractId')
      .addSelect(
        'ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY cp.dueDate)',
        'installmentNumber',
      )
      .innerJoin('cp.contract', 'c');

    // Subquery B: solo vencidas de la A
    const overdueNumbersSubQuery = this.repo
      .createQueryBuilder()
      .select('"inner"."contractId"', 'contractId')
      .addSelect(
        'STRING_AGG(DISTINCT "inner"."installmentNumber"::text, \',\')',
        'overdueNumbers',
      )
      .from('(' + installmentsSubQuery.getQuery() + ')', 'inner')
      .innerJoin('contract_payment', 'cp', 'cp.id = "inner"."paymentId"')
      .where(`cp.dueDate < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'`)
      .andWhere('cp.paidAt IS NULL')
      .andWhere('cp.deletedAt IS NULL')
      .groupBy('"inner"."contractId"')
      .setParameters(installmentsSubQuery.getParameters());

    // Query principal
    const rows = await this.repo
      .createQueryBuilder('cp')
      .innerJoin('cp.contract', 'c')
      .innerJoin('c.vendorId', 'v')
      .innerJoin('c.customerId', 'cust')
      .leftJoin(
        '(' + overdueNumbersSubQuery.getQuery() + ')',
        'sub',
        'sub."contractId" = c.id',
      )
      .setParameters(overdueNumbersSubQuery.getParameters())
      .select('v.id', 'vendorId')
      .addSelect('v.code', 'code')
      .addSelect('v.firstName', 'vendorFirstName')
      .addSelect('v.lastName', 'vendorLastName')
      .addSelect('cust.id', 'customerId')
      .addSelect('cust.firstName', 'customerFirstName')
      .addSelect('cust.lastName', 'customerLastName')
      .addSelect('c.id', 'contractId')
      .addSelect('c.code', 'contractCode')
      .addSelect('COUNT(cp.id)', 'overdueInstallments')
      .addSelect(
        'SUM(cp.installmentAmount - COALESCE(cp.amountPaid, 0))',
        'overdueAmount',
      )
      .addSelect('sub."overdueNumbers"', 'overdueNumbers')
      .where(`cp.dueDate < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'`)
      .andWhere('cp.paidAt IS NULL')
      .andWhere('cp.deletedAt IS NULL')
      .groupBy(
        'v.id, v.code, v.firstName, v.lastName, cust.id, cust.firstName, cust.lastName, c.id, c.code, sub."overdueNumbers"',
      )
      .orderBy('cust.firstName', 'ASC')
      .addOrderBy('c.code', 'ASC')
      .getRawMany<RawRow>();

    // Agrupar en DTO
    const grouped = rows.reduce<Record<string, VendorsWithDebtsDTO>>(
      (acc, row) => {
        if (!acc[row.vendorId]) {
          acc[row.vendorId] = {
            vendorId: row.vendorId,
            code: row.code,
            vendorName: `${row.vendorFirstName} ${row.vendorLastName}`,
            customers: [],
          };
        }

        const vendor = acc[row.vendorId];

        let customer = vendor.customers.find(
          (c) => c.customerId === row.customerId,
        );
        if (!customer) {
          customer = {
            customerId: row.customerId,
            customerName: `${row.customerFirstName} ${row.customerLastName}`,
            contracts: [],
          };
          vendor.customers.push(customer);
        }

        customer.contracts.push({
          contractId: row.contractId,
          contractCode: row.contractCode,
          overdueInstallments: Number(row.overdueInstallments),
          overdueAmount: Number(row.overdueAmount),
          overdueNumbers: row.overdueNumbers
            ? row.overdueNumbers
                .split(',')
                .map(Number)
                .sort((a, b) => a - b)
            : [],
        });

        return acc;
      },
      {},
    );

    return Object.values(grouped);
  }

  async getTotalInstallmentsByVendor(vendorId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('cp')
      .innerJoin('cp.contract', 'c')
      .innerJoin('c.vendorId', 'v')
      .where('v.id = :vendorId', { vendorId })
      .select('SUM(cp.installmentAmount)', 'total')
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async getTotalOverdueByVendor(vendorId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('cp')
      .innerJoin('cp.contract', 'c')
      .innerJoin('c.vendorId', 'v')
      .where('v.id = :vendorId', { vendorId })
      .andWhere(`cp.dueDate < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'`)
      .select(
        'SUM(cp.installmentAmount - COALESCE(cp.amountPaid, 0))',
        'totalDebt',
      )
      .getRawOne<{ totalDebt: string }>();

    return Number(result?.totalDebt ?? 0);
  }
}
