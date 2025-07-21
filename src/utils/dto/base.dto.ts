import { IsUUID } from 'class-validator';

export class UUIDBaseDTO {
  @IsUUID()
  id: string;
}

export class BaseDTO extends UUIDBaseDTO {
  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date;
}
