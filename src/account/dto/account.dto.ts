import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';

export class CreateAccountDTO {
  @IsString()
  owner: string;
}

export class UpdateAccountDTO extends PartialType(CreateAccountDTO) {}
