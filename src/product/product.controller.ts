import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDTO, UpdateProductDTO } from './dto/product.dto';
import { InventoryService } from 'src/inventory/services/inventory.service';
import { Product } from './entities/product.entity';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDTO): Promise<Product> {
    const product = await this.productService.create(createProductDto);

    await this.inventoryService.create({
      productId: product.id,
      stockQuantity: 0,
    });

    return product;
  }

  @Get()
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDTO,
  ): Promise<Product> {
    if (
      updateProductDto.stockQuantity !== undefined &&
      updateProductDto.stockQuantity >= 0
    ) {
      await this.inventoryService.updateStockByProductId(
        id,
        updateProductDto.stockQuantity,
      );
      delete updateProductDto.stockQuantity;
    }
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.inventoryService.removeByProductId(id);
    return this.productService.remove(id);
  }
}
