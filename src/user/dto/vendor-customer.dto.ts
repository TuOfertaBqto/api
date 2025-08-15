import { IsUUID } from 'class-validator';

export class CreateVendorCustomerDTO {
  @IsUUID()
  vendorId: string;

  @IsUUID()
  customerId: string;
}
