import { Injectable, NotFoundException } from '@nestjs/common';
import { Payment, PaymentType } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDTO, UpdatePaymentDTO } from './dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(data: CreatePaymentDTO): Promise<Payment> {
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

  async update(id: string, data: UpdatePaymentDTO): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, data);
    return await this.paymentRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.softRemove(payment);
  }

  async getPaymentsSummaryByType(startDate: Date, endDate: Date) {
    const startStr = startDate.toISOString().slice(0, 10);
    const endStr = endDate.toISOString().slice(0, 10);

    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.type', 'type')
      .addSelect('SUM(payment.amount)', 'total')
      .addSelect('COUNT(payment.id)', 'count')
      .where('payment.deletedAt IS NULL')
      .andWhere('payment.paidAt BETWEEN :start AND :end', {
        start: startStr,
        end: endStr,
      })
      .groupBy('payment.type');

    const result = await query.getRawMany<{
      type: PaymentType;
      total: string;
      count: string;
    }>();

    const resultMap = new Map(
      result.map((r) => [
        r.type,
        { total: Number(r.total), count: Number(r.count) },
      ]),
    );

    const allTypes = Object.values(PaymentType);

    const summary = allTypes.map((type) => ({
      type,
      total: resultMap.get(type)?.total ?? 0,
      count: resultMap.get(type)?.count ?? 0,
    }));

    summary.sort((a, b) => b.total - a.total);

    return summary;
  }
}
