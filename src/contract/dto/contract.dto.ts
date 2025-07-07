import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Agreement } from '../entities/contract.entity';
import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { BaseDTO } from 'src/utils/dto/base.dto';

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

export class UpdateContractDTO extends PartialType(CreateContractDTO) {}

export class ResponseContractDTO extends IntersectionType(
  CreateContractDTO,
  BaseDTO,
) {}
