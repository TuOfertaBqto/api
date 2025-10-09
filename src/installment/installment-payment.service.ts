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
    const installmentPayment = this.repo.create(data);
    return this.repo.save(installmentPayment);
  }
}
