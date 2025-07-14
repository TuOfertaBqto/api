import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Contract } from './contract.entity';

export enum PaymentMethod {
  ZELLE = 'zelle',
  MOBILE_PAYMENT = 'mobile_payment',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}

@Entity('contract_payment')
export class ContractPayment extends BaseModel {
  @ManyToOne(() => Contract)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
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
}
