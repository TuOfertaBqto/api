import { UUIDModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ContractProduct } from './contract-product.entity';

@Entity('product_details')
export class ProductDetails extends UUIDModel {
  @ManyToOne(() => ContractProduct)
  @JoinColumn({ name: 'cp_id' })
  cpId: ContractProduct;

  @Column({ type: 'character varying', name: 'serial_number' })
  serialNumber: string;

  @Column({
    type: 'boolean',
    name: 'is_new',
    default: true,
  })
  isNew: boolean;
}
