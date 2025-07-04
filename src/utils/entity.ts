import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export abstract class UUIDModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

@Entity()
export abstract class BaseModel extends UUIDModel {
  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp without time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp without time zone' })
  deletedAt: Date;
}
