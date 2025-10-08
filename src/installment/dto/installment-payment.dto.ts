import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateInstallmentPaymentDTO {
  @IsUUID()
  @IsNotEmpty()
  installment: string;

  @IsUUID()
  @IsNotEmpty()
  payment: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
