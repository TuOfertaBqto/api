import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { Repository } from 'typeorm';
import { CreateContractDTO, UpdateContractDTO } from './dto/contract.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,

    private readonly userService: UserService,
  ) {}

  async create(dto: CreateContractDTO): Promise<Contract> {
    const vendor = await this.userService.findOne(dto.vendorId);
    const customer = await this.userService.findOne(dto.customerId);

    if (!vendor || !customer) {
      throw new NotFoundException('Vendor or customer not found');
    }

    const contract = this.contractRepo.create({
      vendorId: vendor,
      customerId: customer,
      requestDate: dto.requestDate,
      startDate: dto.startDate,
      endDate: dto.endDate,
      installmentAmount: dto.installmentAmount,
      agreement: dto.agreement,
      totalPrice: dto.totalPrice,
    });

    return this.contractRepo.save(contract);
  }

  findAll(): Promise<Contract[]> {
    return this.contractRepo.find();
  }

  async findOne(id: string): Promise<Contract | null> {
    const contract = await this.contractRepo.findOne({
      where: { id },
    });
    if (!contract) {
      throw new NotFoundException(`Contract #${id} not found`);
    }

    return contract;
  }

  async update(id: string, dto: UpdateContractDTO): Promise<Contract> {
    const contract = await this.findOne(id);

    if (!contract) {
      throw new NotFoundException(`Contract #${id} not found`);
    }

    if (dto.vendorId) {
      const vendor = await this.userService.findOne(dto.vendorId);
      if (!vendor) {
        throw new NotFoundException('Vendor not found');
      }
      contract.vendorId = vendor;
    }

    if (dto.customerId) {
      const customer = await this.userService.findOne(dto.customerId);
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
      contract.customerId = customer;
    }

    if (dto.requestDate !== undefined) contract.requestDate = dto.requestDate;
    if (dto.startDate !== undefined) contract.startDate = dto.startDate;
    if (dto.endDate !== undefined) contract.endDate = dto.endDate;
    if (dto.installmentAmount !== undefined)
      contract.installmentAmount = dto.installmentAmount;
    if (dto.totalPrice !== undefined) contract.totalPrice = dto.totalPrice;
    if (dto.agreement !== undefined) contract.agreement = dto.agreement;

    return await this.contractRepo.save(contract);
  }

  async remove(id: string): Promise<void> {
    await this.contractRepo.softDelete(id);
  }
}
