import { PartialType } from '@nestjs/mapped-types';
import { IsInt, IsUUID } from 'class-validator';

export class CreateInventoryDTO {
  @IsUUID()
  productId: string;

  @IsInt()
  stockQuantity: number;
}

export class UpdateInventoryDTO extends PartialType(CreateInventoryDTO) {}
