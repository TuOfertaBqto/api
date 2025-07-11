import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Agreement } from '../entities/contract.entity';
import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { BaseDTO } from 'src/utils/dto/base.dto';
import { Type } from 'class-transformer';

class ContractProductDTO {
  @IsString()
  productId: string;

  @IsInt()
  quantity: number;
}

export class CreateContractDTO {
  @IsUUID()
  vendorId: string;

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
  installmentAmount: number;

  @IsEnum(Agreement)
  agreement: Agreement;

  @IsNumber()
  totalPrice: number;
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
