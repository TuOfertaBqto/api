import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDTO {
  @IsEnum(PaymentType)
  @IsNotEmpty()
  type: PaymentType;

  @IsOptional()
  @IsInt()
  referenceNumber?: number;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsNotEmpty()
  @IsString()
  owner: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  paidAt: Date;

  @ValidateIf((o: CreatePaymentDTO) =>
    [PaymentType.MOBILE_PAYMENT, PaymentType.BANK_TRANSFER].includes(o.type),
  )
  @IsUUID()
  @IsNotEmpty({ message: 'accountId is required for bank or mobile payments' })
  accountId?: string;
}

export class UpdatePaymentDTO extends PartialType(CreatePaymentDTO) {}
