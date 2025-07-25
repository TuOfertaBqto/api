import { Product } from 'src/product/entities/product.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';

@Entity('inventory')
@Unique(['product'])
export class Inventory extends BaseModel {
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int', name: 'stock_quantity', default: 0 })
  stockQuantity: number;
}
