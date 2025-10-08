import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { ContractService } from '../contract/services/contract.service';
import {
  CreateInstallmentDTO,
  UpdateInstallmentDTO,
  VendorsWithDebtsDTO,
} from './dto/installment.dto';
import { plainToInstance } from 'class-transformer';
import { Installment } from './entities/installment.entity';
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
type VendorPaymentsTotals = {
  totalAmountPaid: number;
  totalOverdueDebt: number;
  totalPendingBalance: number;
  totalDebt: number;
};
type VendorPaymentsSummary = {
  vendorId: string;
  vendorCode: number;
  firstName: string;
  lastName: string;
  totalAmountPaid: number;
  totalOverdueDebt: number;
  totalPendingBalance: number;
  totalDebt: number;
};

@Injectable()
export class InstallmentService {
  constructor(
    @InjectRepository(Installment)
    private readonly repo: Repository<Installment>,
    @Inject(forwardRef(() => ContractService))
    private readonly contractService: ContractService,
  ) {}

  async createMany(data: CreateInstallmentDTO[]): Promise<Installment[]> {
    const payments = this.repo.create(data);
    return this.repo.save(payments);
  }

  async findAll(vendorId: string): Promise<Installment[]> {
    // Todos los vencidos
    const expired = await this.repo
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.contract', 'contract')
      .leftJoinAndSelect('contract.vendorId', 'vendor')
      .leftJoinAndSelect('contract.customerId', 'customer')
      .leftJoinAndSelect('i.installmentPayments', 'installmentPayments')
      .leftJoinAndSelect('installmentPayments.payment', 'payment')
      .where('contract.vendorId = :vendorId', { vendorId })
      .andWhere('i.paid_at IS NULL')
      .andWhere('i.due_date < CURRENT_DATE')
      .orderBy('i.due_date', 'ASC')
      .getMany();

    // Próximo a vencer por contrato
    const next = await this.repo
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.contract', 'contract')
      .leftJoinAndSelect('contract.vendorId', 'vendor')
      .leftJoinAndSelect('contract.customerId', 'customer')
      .leftJoinAndSelect('i.installmentPayments', 'installmentPayments')
      .leftJoinAndSelect('installmentPayments.payment', 'payment')
      .where('contract.vendorId = :vendorId', { vendorId })
      .andWhere('i.paid_at IS NULL')
      .andWhere('i.due_date = sub.min_due')
      .innerJoin(
        (qb) =>
          qb
            .select('cp2.contract_id', 'contract_id')
            .addSelect('MIN(cp2.due_date)', 'min_due')
            .from('installment', 'cp2')
            .where('cp2.paid_at IS NULL')
            .andWhere('cp2.due_date >= CURRENT_DATE')
            .groupBy('cp2.contract_id'),
        'sub',
        'sub.contract_id = i.contract_id',
      )
      .orderBy('i.due_date', 'ASC')
      .getMany();

    const result = [...expired, ...next];

    return plainToInstance(Installment, result, {
      excludeExtraneousValues: false,
    });
  }

  async findOne(id: string): Promise<Installment> {
    const payment = await this.repo.findOne({
      where: { id },
      relations: [
        'contract',
        'installmentPayments',
        'installmentPayments.payment',
      ],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByContract(contractId: string): Promise<Installment[]> {
    return this.repo.find({
      where: { contract: { id: contractId } },
      relations: [
        'contract',
        'installmentPayments',
        'installmentPayments.payment',
      ],
      order: { dueDate: 'ASC' },
    });
  }

  async passDebtToNextInstallment(
    currentPayment: Installment,
    debt: number,
  ): Promise<Installment> {
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
    payment: Installment,
    dto: UpdateInstallmentDTO,
  ): Promise<Installment> {
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
      .createQueryBuilder('i')
      .select('i.id', 'paymentId')
      .addSelect('c.id', 'contractId')
      .addSelect(
        'ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY i.dueDate)',
        'installmentNumber',
      )
      .innerJoin('i.contract', 'c');

    // Subquery B: solo vencidas de la A
    const overdueNumbersSubQuery = this.repo
      .createQueryBuilder()
      .select('"inner"."contractId"', 'contractId')
      .addSelect(
        'STRING_AGG(DISTINCT "inner"."installmentNumber"::text, \',\')',
        'overdueNumbers',
      )
      .from('(' + installmentsSubQuery.getQuery() + ')', 'inner')
      .innerJoin('installment', 'i', 'i.id = "inner"."paymentId"')
      .where(`i.dueDate < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'`)
      .andWhere('i.paidAt IS NULL')
      .andWhere('i.deletedAt IS NULL')
      .groupBy('"inner"."contractId"')
      .setParameters(installmentsSubQuery.getParameters());

    // Query principal
    const rows = await this.repo
      .createQueryBuilder('i')
      .innerJoin('i.contract', 'c')
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
      .addSelect('COUNT(i.id)', 'overdueInstallments')
      .addSelect(
        'SUM(i.installment_amount - COALESCE((SELECT SUM(ip.amount) FROM installment_payment ip WHERE ip.installment_id = i.id), 0))',
        'overdueAmount',
      )
      .addSelect('sub."overdueNumbers"', 'overdueNumbers')
      .where(`i.dueDate < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'`)
      .andWhere('i.paidAt IS NULL')
      .andWhere('i.deletedAt IS NULL')
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
  async getOverdueCustomersByOneVendor(
    vendorId: string,
  ): Promise<VendorsWithDebtsDTO | null> {
    // Subquery A: todas las cuotas numeradas
    const installmentsSubQuery = this.repo
      .createQueryBuilder('i')
      .select('i.id', 'paymentId')
      .addSelect('c.id', 'contractId')
      .addSelect(
        'ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY i.dueDate)',
        'installmentNumber',
      )
      .innerJoin('i.contract', 'c');

    // Subquery B: solo vencidas de la A
    const overdueNumbersSubQuery = this.repo
      .createQueryBuilder()
      .select('"inner"."contractId"', 'contractId')
      .addSelect(
        'STRING_AGG(DISTINCT "inner"."installmentNumber"::text, \',\')',
        'overdueNumbers',
      )
      .from('(' + installmentsSubQuery.getQuery() + ')', 'inner')
      .innerJoin('installment', 'i', 'i.id = "inner"."paymentId"')
      .where(`i.dueDate < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'`)
      .andWhere('i.paidAt IS NULL')
      .andWhere('i.deletedAt IS NULL')
      .groupBy('"inner"."contractId"')
      .setParameters(installmentsSubQuery.getParameters());

    // Query principal
    const rows = await this.repo
      .createQueryBuilder('i')
      .innerJoin('i.contract', 'c')
      .innerJoin('c.vendorId', 'v')
      .innerJoin('c.customerId', 'cust')
      .leftJoin(
        '(' + overdueNumbersSubQuery.getQuery() + ')',
        'sub',
        'sub."contractId" = c.id',
      )
      .leftJoin(
        (qb) =>
          qb
            .select('ip.installment_id', 'installment_id')
            .addSelect('SUM(ip.amount)', 'totalPaid')
            .from('installment_payment', 'ip')
            .where('ip.deleted_at IS NULL')
            .groupBy('ip.installment_id'),
        'p',
        'p.installment_id = i.id',
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
      .addSelect('COUNT(i.id)', 'overdueInstallments')
      .addSelect(
        'SUM(i.installmentAmount - COALESCE(p."totalPaid", 0))',
        'overdueAmount',
      )
      .addSelect('sub."overdueNumbers"', 'overdueNumbers')
      .where(`i.dueDate < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'`)
      .andWhere('i.paidAt IS NULL')
      .andWhere('i.deletedAt IS NULL')
      .andWhere('v.id = :vendorId', { vendorId })
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
    return Object.values(grouped)[0] ?? null;
  }

  async getTotalInstallmentsByVendor(vendorId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('i')
      .innerJoin('i.contract', 'c')
      .innerJoin('c.vendorId', 'v')
      .where('v.id = :vendorId', { vendorId })
      .select('SUM(i.installmentAmount)', 'total')
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async getTotalOverdueByVendor(vendorId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('i')
      .innerJoin('i.contract', 'c')
      .innerJoin('c.vendorId', 'v')
      .where('v.id = :vendorId', { vendorId })
      .andWhere(`i.dueDate < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'`)
      .select(
        `SUM(
          i.installment_amount - COALESCE(
            (SELECT SUM(ip.amount) FROM installment_payment ip WHERE ip.installment_id = i.id),
            0
          )
        )`,
        'totalDebt',
      )
      .getRawOne<{ totalDebt: string }>();
    return Number(result?.totalDebt ?? 0);
  }
  async getOneVendorPaymentsSummary(vendorId: string) {
    return this.repo
      .createQueryBuilder('payment')
      .innerJoin('payment.contract', 'contract')
      .innerJoin('contract.vendorId', 'vendor')
      .where('vendor.id = :vendorId', { vendorId })
      .andWhere('payment.deletedAt IS NULL')
      .select('vendor.id', 'vendorId')
      .addSelect('vendor.code', 'vendorCode')
      .addSelect('vendor.firstName', 'firstName')
      .addSelect('vendor.lastName', 'lastName')
      .addSelect('SUM(COALESCE(payment.amountPaid, 0))', 'totalAmountPaid')
      .addSelect(
        `
    SUM(
      CASE 
        WHEN payment.dueDate < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas' 
             AND payment.paidAt IS NULL
        THEN (payment.installmentAmount - COALESCE(payment.amountPaid, 0)) 
        ELSE 0 
      END
    )`,
        'totalOverdueDebt',
      )
      .addSelect(
        `
    SUM(
      CASE 
        WHEN payment.dueDate >= CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas' 
             AND payment.paidAt IS NULL
        THEN (payment.installmentAmount - COALESCE(payment.amountPaid, 0)) 
        ELSE 0 
      END
    )`,
        'totalPendingBalance',
      )
      .addSelect(
        `
    SUM(
      CASE 
        WHEN payment.paidAt IS NULL
        THEN (payment.installmentAmount - COALESCE(payment.amountPaid, 0)) 
        ELSE 0 
      END
    )`,
        'totalDebt',
      )
      .groupBy('vendor.id')
      .addGroupBy('vendor.code')
      .addGroupBy('vendor.firstName')
      .addGroupBy('vendor.lastName')
      .getRawOne<VendorPaymentsSummary>();
  }
  async getVendorPaymentsSummary() {
    return this.repo
      .createQueryBuilder('i')
      .innerJoin('i.contract', 'contract')
      .innerJoin('contract.vendorId', 'vendor')
      .leftJoin(
        (qb) => {
          return qb
            .from('installment_payment', 'ip')
            .select('ip.installment_id', 'installment_id')
            .addSelect('SUM(ip.amount)', 'paid')
            .groupBy('ip.installment_id');
        },
        'p',
        'p.installment_id = i.id',
      )
      .select('vendor.id', 'vendorId')
      .addSelect('vendor.code', 'vendorCode')
      .addSelect('vendor.firstName', 'firstName')
      .addSelect('vendor.lastName', 'lastName')
      .addSelect('COALESCE(SUM(p.paid), 0)', 'totalAmountPaid')
      .addSelect(
        `SUM(
        CASE 
          WHEN i.due_date < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas' AND i.paid_at IS NULL
          THEN (i.installment_amount - COALESCE(p.paid, 0))
          ELSE 0
        END
      )`,
        'totalOverdueDebt',
      )
      .addSelect(
        `SUM(
        CASE 
          WHEN i.due_date >= CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas' AND i.paid_at IS NULL
          THEN (i.installment_amount - COALESCE(p.paid, 0))
          ELSE 0
        END
      )`,
        'totalPendingBalance',
      )
      .addSelect(
        `SUM(
        CASE 
          WHEN i.paid_at IS NULL
          THEN (i.installment_amount - COALESCE(p.paid, 0))
          ELSE 0
        END
      )`,
        'totalDebt',
      )
      .groupBy('vendor.id')
      .addGroupBy('vendor.code')
      .addGroupBy('vendor.firstName')
      .addGroupBy('vendor.lastName')
      .getRawMany();
  }
  async getGlobalPaymentsSummary(): Promise<VendorPaymentsTotals> {
    const result = await this.repo
      .createQueryBuilder('i')
      .select(
        `SUM(COALESCE((SELECT SUM(ip.amount) FROM installment_payment ip WHERE ip.installment_id = i.id), 0))`,
        'totalAmountPaid',
      )
      .addSelect(
        `SUM(
        CASE 
          WHEN i.due_date < CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'
           AND i.paid_at IS NULL 
          THEN (i.installment_amount - COALESCE((SELECT SUM(ip.amount) FROM installment_payment ip WHERE ip.installment_id = i.id), 0)) 
          ELSE 0 
        END
      )`,
        'totalOverdueDebt',
      )
      .addSelect(
        `SUM(
        CASE 
          WHEN i.due_date >= CURRENT_TIMESTAMP AT TIME ZONE 'America/Caracas'
           AND i.paid_at IS NULL 
          THEN (i.installment_amount - COALESCE((SELECT SUM(ip.amount) FROM installment_payment ip WHERE ip.installment_id = i.id), 0)) 
          ELSE 0 
        END
      )`,
        'totalPendingBalance',
      )
      .addSelect(
        `SUM(
        CASE 
          WHEN i.paid_at IS NULL 
          THEN (i.installment_amount - COALESCE((SELECT SUM(ip.amount) FROM installment_payment ip WHERE ip.installment_id = i.id), 0)) 
          ELSE 0 
        END
      )`,
        'totalDebt',
      )
      .getRawOne<VendorPaymentsTotals>();
    return result as VendorPaymentsTotals;
  }
  async deleteByContractId(contractId: string): Promise<void> {
    const payments = await this.repo.find({
      where: { contract: { id: contractId } },
    });
    if (payments.length) {
      await this.repo.softRemove(payments);
    }
  }
}
