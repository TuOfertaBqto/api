import { User } from 'src/user/entities/user.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ContractProduct } from './contract-product.entity';
import { Installment } from 'src/installment/entities/installment.entity';

export enum Agreement {
  WEEKLY = 'weekly',
  FORTNIGHTLY = 'fortnightly',
  FIFTEEN_AND_LAST = 'fifteen_and_last',
}

export enum ContractStatus {
  CANCELED = 'canceled',
  PENDING = 'pending',
  APPROVED = 'approved',
}

@Entity('contract')
export class Contract extends BaseModel {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendor_id' })
  vendorId: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customerId: User;

  @Column({ type: 'int', generated: 'increment', unique: true })
  code: number;

  @Column({ type: 'timestamp', name: 'request_date' })
  requestDate: Date;

  @Column({ type: 'timestamp', name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: Agreement, name: 'agreement' })
  agreement: Agreement;

  @Column({
    type: 'decimal',
    name: 'total_price',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value ? parseFloat(value) : 0),
    },
  })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    name: 'status',
    default: ContractStatus.PENDING,
  })
  status: ContractStatus;

  @OneToMany(() => ContractProduct, (cp) => cp.contract, { cascade: true })
  products: ContractProduct[];

  @OneToMany(() => Installment, (i) => i.contract, { cascade: true })
  installments: Installment[];
}
