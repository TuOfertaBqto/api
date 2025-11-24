import { Account } from 'src/account/entities/account.entity';
import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Payment } from './payment.entity';
import { BaseModel } from 'src/utils/entity';

@Entity('payment_account')
export class PaymentAccount extends BaseModel {
  @OneToOne(() => Payment, (payment) => payment.account)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @ManyToOne(() => Account, (account) => account.payments)
  @JoinColumn({ name: 'account_id' })
  account: Account;
}
