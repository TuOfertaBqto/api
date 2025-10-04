import { BaseModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

export enum PaymentType {
  ZELLE = 'zelle',
  PAYPAL = 'paypal',
  BINANCE = 'binance',
  MOBILE_PAYMENT = 'mobile_payment',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  DISCOUNT = 'discount',
}

@Entity('payment')
export class Payment extends BaseModel {
  @Column({
    type: 'enum',
    enum: PaymentType,
    enumName: 'payment_type_unique_enum',
    name: 'type',
    nullable: true,
  })
  type: PaymentType;

  @Column({ type: 'int', name: 'reference_number', nullable: true })
  referenceNumber: number;

  @Column({ type: 'text', name: 'photo', nullable: true })
  photo: string;

  @Column({ type: 'varchar', name: 'owner', nullable: true })
  owner: string;

  @Column({
    type: 'decimal',
    name: 'amount',
    precision: 10,
    scale: 2,
  })
  amount: number;

  @Column({ type: 'timestamp', name: 'paid_at', nullable: true })
  paidAt: Date;
}
