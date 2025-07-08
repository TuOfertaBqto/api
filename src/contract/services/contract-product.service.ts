import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContractProduct } from '../entities/contract-product.entity';
import { Repository } from 'typeorm';
import {
  CreateContractProductDTO,
  UpdateContractProductDTO,
} from '../dto/contract-product.dto';
import { Contract } from '../entities/contract.entity';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class ContractProductService {
  constructor(
    @InjectRepository(ContractProduct)
    private readonly contractProductRepo: Repository<ContractProduct>,
  ) {}

  async findAll(): Promise<ContractProduct[]> {
    return this.contractProductRepo.find({
      relations: ['contract', 'product'],
    });
  }

  async findOne(id: string): Promise<ContractProduct> {
    const item = await this.contractProductRepo.findOne({
      where: { id },
      relations: ['contract', 'product'],
    });
    if (!item) throw new NotFoundException(`ContractProduct #${id} not found`);
    return item;
  }

  async create(dto: CreateContractProductDTO): Promise<ContractProduct> {
    const item = this.contractProductRepo.create({
      contract: { id: dto.contractId } as Contract,
      product: { id: dto.productId } as Product,
      deliveryDate: dto.deliveryDate,
      status: dto.status,
    });
    return this.contractProductRepo.save(item);
  }

  async update(
    id: string,
    dto: UpdateContractProductDTO,
  ): Promise<ContractProduct> {
    const item = await this.findOne(id);

    if (dto.contractId) item.contract = { id: dto.contractId } as Contract;
    if (dto.productId) item.product = { id: dto.productId } as Product;
    if (dto.deliveryDate) item.deliveryDate = dto.deliveryDate;
    if (dto.status) item.status = dto.status;

    return this.contractProductRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    await this.contractProductRepo.softDelete(id);
  }
}
