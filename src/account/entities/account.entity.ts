import { BaseModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

@Entity('account')
export class Account extends BaseModel {
  @Column({ type: 'varchar', name: 'owner' })
  owner: string;
}
