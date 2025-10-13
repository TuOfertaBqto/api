import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Contract } from './contract.entity';
import { Product } from 'src/product/entities/product.entity';

export enum ContractProductStatus {
  TO_BUY = 'to_buy',
  TO_DISPATCH = 'to_dispatch',
  DISPATCHED = 'dispatched',
}

@Entity('contract_product')
export class ContractProduct extends BaseModel {
  @ManyToOne(() => Contract, (contract) => contract.products)
  @JoinColumn({ name: 'contract_id' })
  contract: Contract;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', name: 'quantity', default: 0 })
  quantity: number;

  @Column({ type: 'timestamp', name: 'delivery_date', nullable: true })
  deliveryDate: Date;

  @Column({
    type: 'enum',
    enum: ContractProductStatus,
    default: ContractProductStatus.TO_BUY,
    name: 'status',
  })
  status: ContractProductStatus;

  @Column({ type: 'int', name: 'price', default: 0 })
  price: number;

  @Column({
    type: 'decimal',
    name: 'installment_amount',
    precision: 10,
    scale: 2,
    default: 0,
  })
  installmentAmount: number;
}
