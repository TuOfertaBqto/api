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
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDTO, ResponseUserDTO, UpdateUserDTO } from './dto/user.dto';
import { UserRole } from './entities/user.entity';
import { instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDTO): Promise<ResponseUserDTO> {
    if (createUserDto.role && createUserDto.role === UserRole.VENDOR) {
      createUserDto.code = await this.userService.getNextAvailableCode();
    }
    if (
      createUserDto.role !== undefined &&
      [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MAIN].includes(
        createUserDto.role,
      )
    ) {
      const defaultPassword =
        createUserDto.password ||
        this.configService.get<string>('DEFAULT_ADMIN_PASSWORD');
      if (!defaultPassword) {
        throw new HttpException(
          'Password is required for admin users or must be set in env',
          HttpStatus.BAD_REQUEST,
        );
      }
      createUserDto.password = await bcrypt.hash(defaultPassword, 10);
    }

    const userSaved = await this.userService.create(createUserDto);

    return instanceToPlain(userSaved) as ResponseUserDTO;
  }

  @Get()
  async findAll(@Query('role') role?: UserRole) {
    const users = await this.userService.findAll(role);
    return users.map((user) => instanceToPlain(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return instanceToPlain(user) as ResponseUserDTO;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDTO,
  ): Promise<ResponseUserDTO> {
    const userUpdated = await this.userService.update(id, updateUserDto);
    return instanceToPlain(userUpdated) as ResponseUserDTO;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
