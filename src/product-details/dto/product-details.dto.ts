import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class ContractProductRefDTO {
  @IsUUID()
  id: string;
}

export class ProductDetailsDTO {
  @ValidateNested()
  @Type(() => ContractProductRefDTO)
  cpId: ContractProductRefDTO;

  @IsNotEmpty()
  @IsString()
  serialNumber: string;

  @IsBoolean()
  isNew: boolean;
}

export class CreateProductDetailsDTO {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductDetailsDTO)
  items: ProductDetailsDTO[];
}
