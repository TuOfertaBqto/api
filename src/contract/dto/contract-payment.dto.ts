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
import { Agreement } from '../entities/contract.entity';

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

export class CreateListContractPaymentDTO {
  @IsUUID()
  contractId: string;

  @IsDateString()
  startContract: string;

  @IsInt()
  installmentAmountContract: number;

  @IsEnum(Agreement)
  agreementContract: Agreement;

  @IsInt()
  totalPriceContract: number;
}

export class UpdateContractPaymentDTO extends PartialType(
  CreateContractPaymentDTO,
) {}
