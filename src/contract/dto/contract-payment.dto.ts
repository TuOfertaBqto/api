import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaymentMethod } from '../entities/contract-payment.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateContractPaymentDTO {
  @IsUUID()
  contractId: string;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsInt()
  referenceNumber?: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  owner?: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsDateString()
  paidAt?: string;
}

export class UpdateContractPaymentDTO extends PartialType(
  CreateContractPaymentDTO,
) {}
