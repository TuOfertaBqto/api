import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
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

  @IsDateString()
  deliveryDate: Date;

  @IsEnum(ContractProductStatus)
  @IsOptional()
  status?: ContractProductStatus;
}

export class UpdateContractProductDTO extends PartialType(
  CreateContractProductDTO,
) {}
