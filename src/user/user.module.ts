import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { VendorCustomer } from './entities/vendor-customer.entity';
import { VendorCustomerService } from './vendor-customer.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, VendorCustomer]), ConfigModule],
  providers: [UserService, VendorCustomerService],
  exports: [UserService, VendorCustomerService],
  controllers: [UserController],
})
export class UserModule {}
