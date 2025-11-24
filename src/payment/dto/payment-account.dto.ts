import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePaymentAccountDTO {
  @IsUUID()
  @IsNotEmpty()
  paymentId: string;

  @IsUUID()
  @IsNotEmpty()
  accountId: string;
}
