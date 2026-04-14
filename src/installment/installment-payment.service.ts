import { Injectable } from '@nestjs/common';
import { InstallmentPayment } from './entities/installment-payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  async findByInstallmentId(id: string): Promise<InstallmentPayment[]> {
    return await this.repo.find({
      where: {
        installment: { id },
      },
      relations: ['payment', 'installment', 'installment.contract'],
    });
  }

  async findByPaymentIds(paymentIds: string[]): Promise<InstallmentPayment[]> {
    return await this.repo.find({
      where: {
        payment: { id: In(paymentIds) },
      },
      relations: ['installment'],
    });
  }

  async findByInstallmentIds(
    installmentIds: string[],
  ): Promise<InstallmentPayment[]> {
    return await this.repo.find({
      where: {
        installment: { id: In(installmentIds) },
      },
      relations: ['payment'],
    });
  }

  async deleteByPaymentIds(paymentIds: string[]): Promise<void> {
    await this.repo.softDelete({
      payment: {
        id: In(paymentIds),
      },
    });
  }

  async deleteByInstallmentIds(installmentIds: string[]): Promise<void> {
    await this.repo.softDelete({
      installment: {
        id: In(installmentIds),
      },
    });
  }
}
