import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from './dto/user.dto';
import { UserRole } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDTO): Promise<UserDTO> {
    if (
      createUserDto.role !== undefined &&
      [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(createUserDto.role)
    ) {
      const defaultPassword = this.configService.get<string>(
        'DEFAULT_ADMIN_PASSWORD',
      );
      if (!defaultPassword) {
        throw new HttpException(
          'Password is required for admin users or must be set in env',
          HttpStatus.BAD_REQUEST,
        );
      }
      createUserDto.password = defaultPassword;
    }

    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
