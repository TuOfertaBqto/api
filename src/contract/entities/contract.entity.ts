import { User } from 'src/user/entities/user.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ContractProduct } from './contract-product.entity';

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

  @Column({ type: 'int', generated: 'increment', unique: true })
  code: number;

  @Column({ type: 'timestamp', name: 'request_date' })
  requestDate: Date;

  @Column({ type: 'timestamp', name: 'start_date', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', name: 'end_date', nullable: true })
  endDate: Date;

  @Column({ type: 'int', name: 'installment_amount', default: 0 })
  installmentAmount: number;

  @Column({ type: 'enum', enum: Agreement, name: 'agreement' })
  agreement: Agreement;

  @Column({ type: 'int', name: 'total_price', default: 0 })
  totalPrice: number;

  @OneToMany(() => ContractProduct, (cp) => cp.contract, { cascade: true })
  products: ContractProduct[];
}
