import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
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
import { VendorCustomerService } from 'src/user/vendor-customer.service';
import { CreateContractProductDTO } from '../dto/contract-product.dto';

@Controller('contract')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly contraProducService: ContractProductService,
    private readonly vendorCustomerService: VendorCustomerService,
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
      if (vendorId) {
        const exists =
          await this.vendorCustomerService.findOneByVendorAndCustomer(
            vendorId,
            customerId,
          );

        if (!exists) {
          await this.vendorCustomerService.create({ vendorId, customerId });
        }
      }

      contract = await this.contractService.create({
        ...contractData,
        vendorId,
        customerId,
      });
    }

    const contractProducts: CreateContractProductDTO[] = products.map((p) => ({
      contractId: contract.id,
      productId: p.productId,
      quantity: p.quantity,
      status: p.status,
      price: p.price,
      installmentAmount: p.installmentAmount,
    }));

    await this.contraProducService.create(contractProducts);

    return this.contractService.findOne(contract.id);
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

  @Get('count/request')
  async countRequestContract() {
    return this.contractService.countRequestContracts();
  }

  @Get('count')
  async countContracts() {
    const actives = await this.contractService.countActiveContracts();
    const toDispatch = await this.contractService.countPendingDispatch();
    const canceled = await this.contractService.countCanceledContracts();
    const completed = await this.contractService.countCompletedContracts();

    return {
      activeContracts: actives,
      pendingToDispatch: toDispatch,
      canceledContracts: canceled,
      completedContracts: completed,
    };
  }

  @Get('vendor/:vendorId')
  findAllByVendor(@Param('vendorId') vendorId: string) {
    return this.contractService.findAll(vendorId);
  }

  @Get('status/:status')
  async findAllByStatus(
    @Param('status', new ParseEnumPipe(ContractStatus)) status: ContractStatus,
    @Query('type') type?: 'to_dispatch' | 'dispatched' | 'completed',
  ) {
    return this.contractService.findAllByStatus(status, type);
  }

  @Get('vendor/count/:id')
  async countContractsByVendor(
    @Param('id') id: string,
    @ValidatedJwt() payload: JwtPayloadDTO,
  ) {
    let vendorId: string;

    if (payload.role === UserRole.MAIN || payload.role === UserRole.ADMIN) {
      vendorId = id;
    } else {
      if (payload.sub !== id) {
        throw new ForbiddenException(
          'No puedes consultar contratos de otro vendedor',
        );
      }
      vendorId = payload.sub;
    }

    const actives = await this.contractService.countActiveContracts(vendorId);
    const toDispatch =
      await this.contractService.countPendingDispatch(vendorId);
    const canceled =
      await this.contractService.countCanceledContracts(vendorId);
    const completed =
      await this.contractService.countCompletedContracts(vendorId);

    return {
      activeContracts: actives,
      pendingToDispatch: toDispatch,
      canceledContracts: canceled,
      completedContracts: completed,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContractDTO,
  ): Promise<Contract> {
    return this.contractService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }
}
