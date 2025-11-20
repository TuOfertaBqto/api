import { PaymentAccount } from 'src/payment/entities/payment-account.entity';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('account')
export class Account extends BaseModel {
  @Column({ type: 'varchar', name: 'owner' })
  owner: string;

  @OneToMany(() => PaymentAccount, (pa) => pa.account)
  payments: PaymentAccount[];
}
