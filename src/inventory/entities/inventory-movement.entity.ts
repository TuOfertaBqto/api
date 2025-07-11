import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Product } from 'src/product/entities/product.entity';

export enum MovementType {
  IN = 'in',
  OUT = 'out',
}

@Entity('inventory_movement')
export class InventoryMovement extends BaseModel {
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'enum', enum: MovementType, name: 'movement_type' })
  type: MovementType;

  @Column({ type: 'int', name: 'quantity' })
  quantity: number;
}
