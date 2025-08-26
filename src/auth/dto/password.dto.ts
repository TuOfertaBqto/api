import { Transform } from 'class-transformer';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class PasswordDTO {
  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(7)
  password: string;
}

export class ChangePasswordDTO extends PasswordDTO {
  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @MaxLength(255)
  @MinLength(7)
  currentPassword: string;
}
