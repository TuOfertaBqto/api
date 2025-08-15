import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ContractService } from '../services/contract.service';
import {
  CreateContractWithProductsDTO,
  UpdateContractDTO,
} from '../dto/contract.dto';
import { ContractProductService } from '../services/contract-product.service';
import { JwtPayloadDTO } from 'src/auth/dto/jwt.dto';
import { ValidatedJwt } from 'src/auth/decorators/validated-jwt.decorator';
import { UserRole } from 'src/user/entities/user.entity';
import { Contract, ContractStatus } from '../entities/contract.entity';

@Controller('contract')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly contraProducService: ContractProductService,
  ) {}

  @Post()
  async create(
    @ValidatedJwt() payload: JwtPayloadDTO,
    @Body() dto: CreateContractWithProductsDTO,
  ): Promise<Contract> {
    let contract: Contract;
    const { products, vendorId, customerId, ...contractData } = dto;

    if (
      [UserRole.MAIN, UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(
        payload.role,
      )
    ) {
      contractData.status = ContractStatus.APPROVED;
    }

    if (payload.role == UserRole.VENDOR) {
      contract = await this.contractService.create({
        ...contractData,
        vendorId: payload.sub,
        customerId,
      });
    } else {
      contract = await this.contractService.create({
        ...contractData,
        vendorId,
        customerId,
      });
    }

    const contractProducts = products.map((p) => ({
      contractId: contract.id,
      productId: p.productId,
      quantity: p.quantity,
      status: p.status,
    }));

    await this.contraProducService.create(contractProducts);

    return this.contractService.findOne(contract.id);
  }

  @Get()
  findAll() {
    return this.contractService.findAll();
  }

  @Get('request')
  async findRequests(
    @ValidatedJwt() payload: JwtPayloadDTO,
  ): Promise<Contract[]> {
    switch (payload.role) {
      case UserRole.VENDOR:
        return this.contractService.findAllRequestsVendor(payload.sub);

      case UserRole.MAIN:
        return this.contractService.findAllRequestsMain();

      default:
        throw new ForbiddenException(
          'No tienes permiso para ver las solicitudes',
        );
    }
  }

  @Get('count')
  async countContracts() {
    const actives = await this.contractService.countActiveContracts();
    const toDispatch = await this.contractService.countPendingDispatch();

    return { activeContracts: actives, pendingToDispatch: toDispatch };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractDTO) {
    return this.contractService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }
}
