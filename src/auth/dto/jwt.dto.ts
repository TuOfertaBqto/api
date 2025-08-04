import { IsEmail, IsEnum, IsNumber, IsString } from 'class-validator';
import { UserRole } from 'src/user/entities/user.entity';

export class JwtPayloadDTO {
  @IsString()
  sub: string;

  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsNumber()
  iat?: number;

  @IsNumber()
  exp?: number;
}
