import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Agreement, Contract } from 'src/contract/entities/contract.entity';
import { Type } from 'class-transformer';

export class CreateInstallmentDTO {
  @ValidateNested()
  @Type(() => Contract)
  contract: { id: string };

  @IsDateString()
  dueDate: string;

  @IsInt()
  installmentAmount: number;

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

export class CreateListInstallmentDTO {
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

export class UpdateInstallmentDTO extends PartialType(CreateInstallmentDTO) {}

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
