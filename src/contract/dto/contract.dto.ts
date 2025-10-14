import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Agreement, ContractStatus } from '../entities/contract.entity';
import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { Type } from 'class-transformer';
import { ContractProductStatus } from '../entities/contract-product.entity';

class ContractProductDTO {
  @IsString()
  productId: string;

  @IsInt()
  quantity: number;

  @IsEnum(ContractProductStatus)
  status: ContractProductStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  installmentAmount: number;
}

export class CreateContractDTO {
  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @IsUUID()
  customerId: string;

  @IsDateString()
  requestDate: Date;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  installmentAmount?: number;

  @IsEnum(Agreement)
  agreement: Agreement;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}

export class CreateContractWithProductsDTO extends CreateContractDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractProductDTO)
  products: ContractProductDTO[];
}

export class UpdateContractDTO extends PartialType(CreateContractDTO) {}

export class ResponseContractDTO extends IntersectionType(
  CreateContractDTO,
  BaseDTO,
) {}
