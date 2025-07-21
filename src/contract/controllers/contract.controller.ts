import {
  Body,
  Controller,
  Delete,
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

@Controller('contract')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly contraProducService: ContractProductService,
  ) {}

  @Post()
  async create(@Body() dto: CreateContractWithProductsDTO) {
    const { products, vendorId, customerId, ...contractData } = dto;

    const contract = await this.contractService.create({
      ...contractData,
      vendorId,
      customerId,
    });

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
