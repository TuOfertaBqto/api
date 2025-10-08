import { Injectable } from '@nestjs/common';
import { InstallmentPayment } from './entities/installment-payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInstallmentPaymentDTO } from './dto/installment-payment.dto';

@Injectable()
export class InstallmentPaymentService {
  constructor(
    @InjectRepository(InstallmentPayment)
    private readonly repo: Repository<InstallmentPayment>,
  ) {}

  async create(data: CreateInstallmentPaymentDTO): Promise<InstallmentPayment> {
    const installmentPayment = this.repo.create({
      installment: { id: data.installment },
      payment: { id: data.payment },
      amount: data.amount,
    });
    return this.repo.save(installmentPayment);
  }
}
