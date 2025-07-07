import { User } from 'src/user/entities/user.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

export enum Agreement {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

@Entity('contract')
export class Contract extends BaseModel {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendor_id' })
  vendorId: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customerId: User;

  @Column({ type: 'datetime', name: 'request_date' })
  requestDate: Date;

  @Column({ type: 'datetime', name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ type: 'datetime', name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ type: 'integer', name: 'installment_amount' })
  installmentAmount: number;

  @Column({ type: 'enum', enum: Agreement, name: 'agreement' })
  agreement: Agreement;

  @Column({ type: 'integer', name: 'total_price' })
  totalPrice: number;
}
