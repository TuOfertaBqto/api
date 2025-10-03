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
} from 'class-validator';
import { PaymentMethod } from 'src/installment/entities/installment.entity';

export class CreatePaymentDTO {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  type: PaymentMethod;

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
}

export class UpdatePaymentDTO extends PartialType(CreatePaymentDTO) {}
