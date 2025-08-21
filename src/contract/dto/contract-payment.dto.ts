import {
  ArrayNotEmpty,
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
import { PaymentMethod } from '../entities/contract-payment.entity';
import { PartialType } from '@nestjs/mapped-types';
import { Agreement, Contract } from '../entities/contract.entity';
import { Type } from 'class-transformer';

export class CreateContractPaymentDTO {
  @ValidateNested()
  @Type(() => Contract)
  contract: { id: string };

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

  @IsInt()
  installmentAmount: number;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsNumber()
  debt?: number;
}

class ProductPaymentDTO {
  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  installmentAmount: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateListContractPaymentDTO {
  @IsUUID()
  contractId: string;

  @IsDateString()
  startContract: string;

  @IsEnum(Agreement)
  agreementContract: Agreement;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductPaymentDTO)
  products: ProductPaymentDTO[];
}

export class UpdateContractPaymentDTO extends PartialType(
  CreateContractPaymentDTO,
) {}

class ContractDebt {
  contractId: string;
  contractCode: string;
  overdueInstallments: number;
  overdueAmount: number;
  overdueNumbers: number[];
}

class CustomerWithDebt {
  customerId: string;
  customerName: string;
  contracts: ContractDebt[];
}
export class VendorsWithDebtsDTO {
  vendorId: string;
  code: string;
  vendorName: string;
  customers: CustomerWithDebt[];
}
