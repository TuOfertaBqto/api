import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
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
}

export class UpdateContractProductDTO extends PartialType(
  CreateContractProductDTO,
) {}
