import { forwardRef, Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { Inventory } from './entities/inventory.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { InventoryMovementController } from './controllers/inventory-movement.controller';
import { InventoryMovementService } from './services/inventory-movement.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, InventoryMovement]),
    forwardRef(() => ProductModule),
  ],
  controllers: [InventoryController, InventoryMovementController],
  providers: [InventoryService, InventoryMovementService],
  exports: [InventoryService],
})
export class InventoryModule {}
