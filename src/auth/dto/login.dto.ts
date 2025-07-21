import { Transform } from 'class-transformer';
import { PasswordDTO } from './password.dto';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDTO extends PasswordDTO {
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class LoginResponseDTO {
  accessToken: string;
}
