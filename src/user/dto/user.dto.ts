import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { IntersectionType, PartialType } from '@nestjs/mapped-types';
import { BaseDTO } from 'src/utils/dto/base.dto';

export class UserDTO {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  documentId: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  adress: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class CreateUserDTO extends UserDTO {
  @IsString()
  @IsOptional()
  password?: string;
}

export class UpdateUserDTO extends PartialType(UserDTO) {}

export class ResponseUserDTO extends IntersectionType(UserDTO, BaseDTO) {
  code?: string | undefined;
}
