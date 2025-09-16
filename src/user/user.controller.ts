import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import {
  CreateUserDTO,
  ResponseUserDTO,
  UpdateUserDTO,
  VendorStatsDTO,
} from './dto/user.dto';
import { User, UserRole } from './entities/user.entity';
import { instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { VendorCustomerService } from './vendor-customer.service';
import { ValidatedJwt } from 'src/auth/decorators/validated-jwt.decorator';
import { JwtPayloadDTO } from 'src/auth/dto/jwt.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly vendorCustomerService: VendorCustomerService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async create(
    @ValidatedJwt() payload: JwtPayloadDTO,
    @Body() createUserDto: CreateUserDTO,
  ): Promise<ResponseUserDTO> {
    if (createUserDto.role && createUserDto.role === UserRole.VENDOR) {
      createUserDto.code = await this.userService.getNextAvailableCode();

      if (!createUserDto.documentId) {
        throw new HttpException(
          'document_id is required for vendor users',
          HttpStatus.BAD_REQUEST,
        );
      }
      createUserDto.password = await bcrypt.hash(createUserDto.documentId, 10);
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

    if (payload.role === UserRole.VENDOR) {
      await this.vendorCustomerService.create({
        vendorId: payload.sub,
        customerId: userSaved.id,
      });
    }

    return instanceToPlain(userSaved) as ResponseUserDTO;
  }

  @Get()
  async findAll(
    @ValidatedJwt() payload: JwtPayloadDTO,
    @Query('role') role?: UserRole,
  ) {
    let users: User[] = [];
    if (payload.role === UserRole.VENDOR) {
      users = await this.vendorCustomerService.findCustomersByVendor(
        payload.sub,
      );
    } else {
      users = await this.userService.findAll(role);
    }
    return users.map((user) => instanceToPlain(user));
  }

  @Get('vendors')
  async findAllVendor() {
    const vendors = await this.userService.findAll(UserRole.VENDOR);
    return vendors.map((user) => instanceToPlain(user));
  }

  @Get('vendor-stats')
  async getVendorsContractsStats(): Promise<VendorStatsDTO[]> {
    const stats = await this.userService.getVendorsWithContractsStats();

    return stats;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return instanceToPlain(user) as ResponseUserDTO;
  }

  @Get('profile/:id')
  async getProfile(
    @ValidatedJwt() payload: JwtPayloadDTO,
    @Param('id') id: string,
  ) {
    let user: User;
    if (payload.role === UserRole.MAIN || payload.role === UserRole.ADMIN) {
      user = await this.userService.findOne(id);
    } else {
      if (payload.sub !== id) {
        throw new ForbiddenException('No puedes ver el perfil de otro usuario');
      }
      user = await this.userService.findOne(payload.sub);
    }
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
