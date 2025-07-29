import { PartialType } from '@nestjs/mapped-types';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}

export class UpdateProductDTO extends PartialType(CreateProductDTO) {
  @IsInt()
  @IsOptional()
  stockQuantity?: number;
}
