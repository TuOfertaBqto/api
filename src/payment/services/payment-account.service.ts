import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentAccount } from '../entities/payment-account.entity';
import { Repository } from 'typeorm';
import { PaymentService } from './payment.service';
import { AccountService } from 'src/account/account.service';
import { CreatePaymentAccountDTO } from '../dto/payment-account.dto';

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
}
