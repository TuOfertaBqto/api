import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Installment } from './installment.entity';
import { Payment } from 'src/payment/entities/payment.entity';

@Entity('installment_payment')
export class InstallmentPayment extends BaseModel {
  @ManyToOne(() => Installment, (i) => i.installmentPayments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'installment_id' })
  installment: Installment;

  @ManyToOne(() => Payment, (p) => p.installmentPayments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount: number;
}
