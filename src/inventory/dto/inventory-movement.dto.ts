import { IsEnum, IsInt, IsUUID } from 'class-validator';
import { MovementType } from '../entities/inventory-movement.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateInventoryMovementDTO {
  @IsUUID()
  productId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  quantity: number;
}

export class UpdateInventoryMovementDTO extends PartialType(
  CreateInventoryMovementDTO,
) {}
