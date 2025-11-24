import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentAccount } from '../entities/payment-account.entity';
import { Repository } from 'typeorm';
import { PaymentService } from './payment.service';
import { AccountService } from 'src/account/account.service';
import { CreatePaymentAccountDTO } from '../dto/payment-account.dto';

interface TotalsByAccountRaw {
  accountId: number;
  owner: string;
  totalMobile: string;
  totalTransfer: string;
  countMobile: string;
  countTransfer: string;
}

class TotalsByAccountResponse {
  accountId: number;
  owner: string;
  totalMobile: number;
  totalTransfer: number;
  countMobile: number;
  countTransfer: number;
}

@Injectable()
export class PaymentAccountService {
  constructor(
    @InjectRepository(PaymentAccount)
    private readonly paymentAccountRepository: Repository<PaymentAccount>,
    private readonly paymentService: PaymentService,
    private readonly accountService: AccountService,
  ) {}

  async create(dto: CreatePaymentAccountDTO) {
    const payment = await this.paymentService.findOne(dto.paymentId);
    const account = await this.accountService.findOne(dto.accountId);

    const paymentAccount = this.paymentAccountRepository.create({
      payment,
      account,
    });

    return await this.paymentAccountRepository.save(paymentAccount);
  }

  async getTotalsByAccount(
    startDate: Date,
    endDate: Date,
  ): Promise<TotalsByAccountResponse[]> {
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    const rows: TotalsByAccountRaw[] = await this.paymentAccountRepository
      .createQueryBuilder('paymentAccount')
      .innerJoin('paymentAccount.payment', 'payment')
      .innerJoin('paymentAccount.account', 'account')
      .select('account.id', 'accountId')
      .addSelect('account.owner', 'owner')
      .addSelect(
        `
      SUM(CASE WHEN payment.type = 'mobile_payment' THEN payment.amount ELSE 0 END)
    `,
        'totalMobile',
      )
      .addSelect(
        `
      SUM(CASE WHEN payment.type = 'bank_transfer' THEN payment.amount ELSE 0 END)
    `,
        'totalTransfer',
      )
      .addSelect(
        `
      COUNT(CASE WHEN payment.type = 'mobile_payment' THEN 1 END)
    `,
        'countMobile',
      )
      .addSelect(
        `
      COUNT(CASE WHEN payment.type = 'bank_transfer' THEN 1 END)
    `,
        'countTransfer',
      )
      .where(`payment.type IN ('mobile_payment', 'bank_transfer')`)
      .andWhere('payment.paid_at BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      })
      .groupBy('account.id')
      .addGroupBy('account.owner')
      .getRawMany();

    return rows.map((row) => ({
      ...row,
      totalMobile: Number(row.totalMobile),
      totalTransfer: Number(row.totalTransfer),
      countMobile: Number(row.countMobile),
      countTransfer: Number(row.countTransfer),
    }));
  }
}
