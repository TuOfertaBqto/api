import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorCustomer } from './entities/vendor-customer.entity';
import { User, UserRole } from './entities/user.entity';
import { CreateVendorCustomerDTO } from './dto/vendor-customer.dto';
import { UserService } from './user.service';

@Injectable()
export class VendorCustomerService {
  constructor(
    @InjectRepository(VendorCustomer)
    private readonly vendorCustomerRepo: Repository<VendorCustomer>,

    private readonly userService: UserService,
  ) {}

  async create(dto: CreateVendorCustomerDTO): Promise<VendorCustomer> {
    const { vendorId, customerId } = dto;

    if (vendorId === customerId) {
      throw new BadRequestException('Vendor y customer no pueden ser iguales');
    }

    const vendor = await this.userService.findOne(vendorId);
    const customer = await this.userService.findOne(customerId);

    // TODO: No necesariamente tiene que ser vendedor, tambien puede ser main, admin...
    if (!vendor /*|| vendor.role !== UserRole.VENDOR */) {
      throw new BadRequestException('El vendor no es válido');
    }

    if (!customer || customer.role !== UserRole.CUSTOMER) {
      throw new BadRequestException('El customer no es válido');
    }

    const exists = await this.vendorCustomerRepo.findOne({
      where: {
        vendor: { id: vendorId },
        customer: { id: customerId },
      },
    });

    if (exists) {
      throw new BadRequestException('Esta relación ya existe');
    }

    const relation = this.vendorCustomerRepo.create({
      vendor,
      customer,
    });

    return await this.vendorCustomerRepo.save(relation);
  }

  async findOneByVendorAndCustomer(
    vendorId: string,
    customerId: string,
  ): Promise<VendorCustomer | null> {
    const relation = await this.vendorCustomerRepo.findOne({
      where: {
        vendor: { id: vendorId },
        customer: { id: customerId },
      },
    });

    return relation;
  }

  async remove(vendorId: string, customerId: string): Promise<void> {
    const relation = await this.vendorCustomerRepo.findOne({
      where: {
        vendor: { id: vendorId },
        customer: { id: customerId },
      },
    });

    if (!relation) {
      throw new NotFoundException('Relación no encontrada');
    }

    await this.vendorCustomerRepo.remove(relation);
  }

  async findCustomersByVendor(vendorId: string): Promise<User[]> {
    const vendor = await this.userService.findOne(vendorId);

    if (!vendor /*|| vendor.role !== UserRole.VENDOR*/) {
      throw new NotFoundException('Vendedor no válido');
    }

    const relations = await this.vendorCustomerRepo.find({
      where: { vendor: { id: vendorId } },
      relations: ['customer'],
    });

    return relations.map((r) => r.customer);
  }
}
