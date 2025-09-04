import { Category } from 'src/category/entities/category.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('product')
export class Product extends BaseModel {
  @Column({ type: 'character varying', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'int', name: 'price' })
  price: number;

  @Column({ type: 'int', name: 'installment_amount', default: 0 })
  installmentAmount: number;

  @Column({ type: 'boolean', name: 'is_visible', default: true })
  isVisible: boolean;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  categoryId: Category;
}
