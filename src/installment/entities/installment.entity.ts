import { Contract } from 'src/contract/entities/contract.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { InstallmentPayment } from './installment-payment.entity';

export enum PaymentMethod {
  ZELLE = 'zelle',
  PAYPAL = 'paypal',
  BINANCE = 'binance',
  MOBILE_PAYMENT = 'mobile_payment',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  DISCOUNT = 'discount',
}

@Entity('installment')
export class Installment extends BaseModel {
  @ManyToOne(() => Contract)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    enumName: 'payment_type_enum',
    name: 'payment_method',
    nullable: true,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'int', name: 'reference_number', nullable: true })
  referenceNumber: number;

  @Column({ type: 'text', name: 'photo', nullable: true })
  photo: string;

  @Column({ type: 'varchar', name: 'owner', nullable: true })
  owner: string;

  @Column({ type: 'timestamp', name: 'due_date' })
  dueDate: Date;

  @Column({ type: 'int', name: 'installment_amount', default: 0 })
  installmentAmount: number;

  @Column({
    type: 'decimal',
    name: 'amount_paid',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  amountPaid: number;

  @Column({ type: 'timestamp', name: 'paid_at', nullable: true })
  paidAt: Date;

  @Column({
    type: 'decimal',
    name: 'debt',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  debt: number;

  @OneToMany(() => InstallmentPayment, (ip) => ip.installment)
  installmentPayments: InstallmentPayment[];
}
