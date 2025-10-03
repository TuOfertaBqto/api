import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment } from './entities/payment.entity';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() data: Partial<Payment>) {
    return this.paymentService.create(data);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Partial<Payment>) {
    return this.paymentService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
}
