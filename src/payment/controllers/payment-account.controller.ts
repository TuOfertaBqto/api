import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { PaymentAccountService } from '../services/payment-account.service';

@Controller('payment-account')
export class PaymentAccountController {
  constructor(private readonly paymentAccountService: PaymentAccountService) {}

  @Get('totals-by-account')
  async totalsByAccount(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    console.log('test');
    if (!start || !end) {
      throw new BadRequestException('Debe indicar startDate y endDate');
    }
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > endDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la fecha final',
      );
    }

    return this.paymentAccountService.getTotalsByAccount(startDate, endDate);
  }
}
