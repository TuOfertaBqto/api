import { CreateContractPaymentDTO } from 'src/contract/dto/contract-payment.dto';
import { Agreement } from 'src/contract/entities/contract.entity';

interface ProductPayment {
  price: number;
  installmentAmount: number;
  quantity: number;
}

export function getNextSaturday(fromDate: string | Date): Date {
  const date =
    typeof fromDate === 'string'
      ? new Date(fromDate + 'T00:00:00')
      : new Date(fromDate);

  const day = date.getDay();
  const diff = day === 6 ? 7 : 6 - day;

  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function generateInstallments(
  contractId: string,
  products: ProductPayment[],
  agreement: Agreement,
  startDate: Date,
): CreateContractPaymentDTO[] {
  const payments: CreateContractPaymentDTO[] = [];

  const intervalDays = agreement === Agreement.WEEKLY ? 7 : 14;

  const remainingProducts = products.map((p) => {
    let adjustedInstallment = p.installmentAmount * p.quantity;

    if (agreement === Agreement.FORTNIGHTLY) {
      adjustedInstallment *= 2;
    }

    const totalCost = p.price * p.quantity;

    return {
      remainingBalance: totalCost,
      adjustedInstallment,
    };
  });

  let installmentIndex = 0;

  while (remainingProducts.some((p) => p.remainingBalance > 0)) {
    let periodPayment = 0;

    remainingProducts.forEach((p) => {
      if (p.remainingBalance > 0) {
        if (p.remainingBalance >= p.adjustedInstallment) {
          periodPayment += p.adjustedInstallment;
          p.remainingBalance -= p.adjustedInstallment;
        } else {
          periodPayment += p.remainingBalance;
          p.remainingBalance = 0;
        }
      }
    });

    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + installmentIndex * intervalDays);

    payments.push({
      contract: { id: contractId },
      dueDate: dueDate.toISOString(),
      installmentAmount: periodPayment,
      debt:
        installmentIndex === 0
          ? products.reduce((sum, prod) => sum + prod.price * prod.quantity, 0)
          : undefined,
    });

    installmentIndex++;
  }

  return payments;
}
