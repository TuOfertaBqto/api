import { Type } from 'class-transformer';
import { IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { Installment } from '../entities/installment.entity';
import { Payment } from 'src/payment/entities/payment.entity';

export class CreateInstallmentPaymentDTO {
  @ValidateNested()
  @Type(() => Installment)
  installment: { id: string };

  @ValidateNested()
  @Type(() => Payment)
  payment: { id: string };

  @IsNumber()
  @IsPositive()
  amount: number;
}
