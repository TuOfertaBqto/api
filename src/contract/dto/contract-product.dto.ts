import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ContractProductStatus } from '../entities/contract-product.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateContractProductDTO {
  @IsUUID()
  @IsNotEmpty()
  contractId: string;

  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsDateString()
  @IsOptional()
  deliveryDate?: Date;

  @IsEnum(ContractProductStatus)
  @IsOptional()
  status?: ContractProductStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  installmentAmount: number;
}

export class UpdateContractProductDTO extends PartialType(
  CreateContractProductDTO,
) {}

export class BulkUpdateContractProductDTO extends PartialType(
  CreateContractProductDTO,
) {
  @IsUUID()
  @IsOptional()
  id?: string;
}
