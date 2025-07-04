import { Exclude } from 'class-transformer';
import { BaseModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

export enum UserRole {
  MAIN = 'main',
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

@Entity('user')
export class User extends BaseModel {
  @Column({
    type: 'character varying',
    name: 'code',
    unique: true,
    nullable: true,
  })
  code?: string;

  @Column({ type: 'character varying', name: 'first_name' })
  firstName: string;

  @Column({ type: 'character varying', name: 'last_name' })
  lastName: string;

  @Column({ type: 'character varying', name: 'document_id', unique: true })
  documentId: string;

  @Column({ type: 'character varying', unique: true })
  email: string;

  @Column({ type: 'character varying', name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Exclude()
  @Column({ type: 'character varying' })
  password: string;

  @Column({ type: 'character varying', name: 'adress' })
  adress: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;
}
