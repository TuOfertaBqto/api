import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ContractProduct,
  ContractProductStatus,
} from '../entities/contract-product.entity';
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

  async getToDispatchQuantity(productId: string): Promise<number> {
    const result: { total: string | null } | undefined =
      await this.contractProductRepo
        .createQueryBuilder('cp')
        .select('SUM(cp.quantity)', 'total')
        .where('cp.product = :productId', { productId })
        .andWhere('cp.status = :status', {
          status: ContractProductStatus.TO_DISPATCH,
        })
        .getRawOne();

    return Number(result?.total ?? 0);
  }

  async create(dto: CreateContractProductDTO[]): Promise<ContractProduct[]> {
    const entities = dto.map((p) =>
      this.contractProductRepo.create({
        contract: { id: p.contractId },
        product: { id: p.productId },
        quantity: p.quantity,
        status: p.status,
      }),
    );

    return this.contractProductRepo.save(entities);
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
