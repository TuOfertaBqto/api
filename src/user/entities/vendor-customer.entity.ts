import { BaseModel } from 'src/utils/entity';
import { Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('vendor_customer')
@Unique(['vendor', 'customer'])
export class VendorCustomer extends BaseModel {
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendor_id' })
  vendor: User;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;
}
