import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract, ContractStatus } from '../entities/contract.entity';
import { Repository } from 'typeorm';
import { CreateContractDTO, UpdateContractDTO } from '../dto/contract.dto';
import { UserService } from 'src/user/user.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,

    private readonly userService: UserService,
  ) {}

  async create(dto: CreateContractDTO): Promise<Contract> {
    const { vendorId, customerId, ...contractData } = dto;

    if (!vendorId) {
      throw new NotFoundException('Vendor ID is required');
    }

    const [vendor, customer] = await Promise.all([
      this.userService.findOne(vendorId),
      this.userService.findOne(customerId),
    ]);

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const contract = this.contractRepo.create({
      vendorId: vendor,
      customerId: customer,
      ...contractData,
    });

    return this.contractRepo.save(contract);
  }

  async findAll(): Promise<Contract[]> {
    const contracts = await this.contractRepo
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.vendorId', 'vendor')
      .leftJoinAndSelect('contract.customerId', 'customer')
      .leftJoinAndSelect('contract.products', 'contractProduct')
      .leftJoinAndSelect('contractProduct.product', 'product')
      .addSelect(
        `
      CASE
        WHEN EXISTS (
          SELECT 1 FROM contract_product cp
          WHERE cp.contract_id = contract.id AND cp.status = 'to_buy'
        ) THEN 1
        WHEN EXISTS (
          SELECT 1 FROM contract_product cp
          WHERE cp.contract_id = contract.id AND cp.status = 'to_dispatch'
        ) THEN 2
        ELSE 3
      END
    `,
        'priority',
      )
      .orderBy('priority', 'ASC')
      .addOrderBy('contract.createdAt', 'DESC')
      .getMany();

    return instanceToPlain(contracts) as Contract[];
  }

  async findAllRequests(vendorId?: string): Promise<Contract[]> {
    const query = this.contractRepo
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.vendorId', 'vendor')
      .leftJoinAndSelect('contract.customerId', 'customer')
      .leftJoinAndSelect('contract.products', 'contractProduct')
      .leftJoinAndSelect('contractProduct.product', 'product')
      .where('contract.status = :status', { status: ContractStatus.PENDING });

    if (vendorId) {
      query.andWhere('contract.vendorId = :vendorId', { vendorId });
    }
    const contracts = await query.getMany();

    return instanceToPlain(contracts) as Contract[];
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepo.findOne({
      where: { id },
      relations: ['vendorId', 'customerId', 'products', 'products.product'],
    });
    if (!contract) {
      throw new NotFoundException(`Contract #${id} not found`);
    }

    return instanceToPlain(contract) as Contract;
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
    if (dto.status !== undefined) contract.status = dto.status;

    return await this.contractRepo.save(contract);
  }

  async remove(id: string): Promise<void> {
    await this.contractRepo.softDelete(id);
  }
}
