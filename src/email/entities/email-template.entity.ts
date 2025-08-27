import { UUIDModel } from 'src/utils/entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class EmailTemplate extends UUIDModel {
  @Column({ type: 'varchar', name: 'name', length: 255, unique: true })
  name: string;

  @Column({ type: 'text', name: 'html' })
  html: string;

  @Column({ type: 'text', name: 'text' })
  text: string;
}
