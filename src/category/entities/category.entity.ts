import { UUIDModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

@Entity('category')
export class Category extends UUIDModel {
  @Column({ type: 'character varying', name: 'name', unique: true })
  name: string;
}
