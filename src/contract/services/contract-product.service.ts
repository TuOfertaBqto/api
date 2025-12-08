import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ContractProduct,
  ContractProductStatus,
} from '../entities/contract-product.entity';
import { Repository } from 'typeorm';
import {
  BulkUpdateContractProductDTO,
  CreateContractProductDTO,
  ProductDispatchedTotalsDTO,
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

  async getVendorEarnings(vendorId: string): Promise<number> {
    const result = await this.contractProductRepo
      .createQueryBuilder('cp')
      .innerJoin('cp.contract', 'c')
      .where('c.vendor_id = :vendorId', { vendorId })
      .andWhere('cp.deleted_at IS NULL')
      .andWhere('cp.status = :status', {
        status: ContractProductStatus.DISPATCHED,
      })
      .select('SUM(cp.installment_amount * cp.quantity * 2)', 'total')
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
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

  async getProductDispatchedTotals(): Promise<ProductDispatchedTotalsDTO[]> {
    return await this.contractProductRepo
      .createQueryBuilder('cp')
      .innerJoin('cp.product', 'p')
      .where('cp.status = :status', {
        status: ContractProductStatus.DISPATCHED,
      })
      .andWhere('cp.deleted_at IS NULL')
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('SUM(cp.quantity)', 'totalDispatched')
      .groupBy('p.id')
      .addGroupBy('p.name')
      .orderBy('"totalDispatched"', 'DESC')
      .getRawMany<ProductDispatchedTotalsDTO>();
  }

  async create(dto: CreateContractProductDTO[]): Promise<ContractProduct[]> {
    const entities = dto.map((p) =>
      this.contractProductRepo.create({
        contract: { id: p.contractId },
        product: { id: p.productId },
        quantity: p.quantity,
        status: p.status,
        installmentAmount: p.installmentAmount,
        price: p.price,
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

  async updateMany(
    dtos: BulkUpdateContractProductDTO[],
  ): Promise<ContractProduct[]> {
    const entities = dtos.map((dto) => {
      const entity = this.contractProductRepo.create({
        ...dto,
        contract: dto.contractId
          ? ({ id: dto.contractId } as Contract)
          : undefined,
        product: dto.productId ? ({ id: dto.productId } as Product) : undefined,
      });
      return entity;
    });

    return this.contractProductRepo.save(entities);
  }

  async remove(id: string): Promise<void> {
    await this.contractProductRepo.softDelete(id);
  }

  async deleteByContractId(contractId: string): Promise<void> {
    const products = await this.contractProductRepo.find({
      where: { contract: { id: contractId } },
    });
    if (products.length) {
      await this.contractProductRepo.softRemove(products);
    }
  }
}
