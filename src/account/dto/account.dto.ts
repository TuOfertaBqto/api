import { IsString } from 'class-validator';

export class CreateAccountDTO {
  @IsString()
  owner: string;
}
