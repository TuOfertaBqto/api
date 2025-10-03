import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  // Crear un pago
  async create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentRepository.create(data);
    return await this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async update(id: string, data: Partial<Payment>): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, data);
    return await this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.softRemove(payment);
  }
}
