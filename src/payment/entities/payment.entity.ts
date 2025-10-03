import { PaymentMethod } from 'src/installment/entities/installment.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

@Entity('payment')
export class Payment extends BaseModel {
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'type',
    nullable: true,
  })
  type: PaymentMethod;

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
