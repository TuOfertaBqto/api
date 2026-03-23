import { CreateInstallmentDTO } from 'src/installment/dto/installment.dto';
import { Agreement } from 'src/contract/entities/contract.entity';

interface ProductPayment {
  price: number;
  installmentAmount: number;
  quantity: number;
}

export function getNextSaturday(
  fromDate: string | Date,
  type: Agreement = Agreement.WEEKLY,
  isFirst = false,
): Date {
  const date =
    typeof fromDate === 'string'
      ? new Date(fromDate + 'T00:00:00')
      : new Date(fromDate);

  const day = date.getDay();
  const diff = day === 6 ? 7 : 6 - day;

  const offset = type === Agreement.FORTNIGHTLY && !isFirst ? diff + 7 : diff;

  date.setDate(date.getDate() + offset);
  date.setHours(0, 0, 0, 0);

  return date;
}

export function getNextFortnight(fromDate: string | Date): Date {
  const date =
    typeof fromDate === 'string'
      ? new Date(fromDate + 'T00:00:00')
      : new Date(fromDate);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const fifteenth = new Date(year, month, 15, 0, 0, 0, 0);

  const lastOfMonth = new Date(year, month + 1, 0, 0, 0, 0, 0);

  let nextDate: Date;

  if (day < 15) {
    nextDate = fifteenth;
  } else if (day >= 15 && day < lastOfMonth.getDate()) {
    nextDate = lastOfMonth;
  } else {
    nextDate = new Date(year, month + 1, 15, 0, 0, 0, 0);
  }

  return nextDate;
}

export function generateInstallments(
  contractId: string,
  products: ProductPayment[],
  agreement: Agreement,
  startDate: string | Date,
): CreateInstallmentDTO[] {
  const payments: CreateInstallmentDTO[] = [];

  const remainingProducts = products.map((p) => {
    let adjustedInstallment = p.installmentAmount * p.quantity;

    if (
      agreement === Agreement.FORTNIGHTLY ||
      agreement === Agreement.FIFTEEN_AND_LAST
    ) {
      adjustedInstallment *= 2;
    }

    const totalCost = p.price * p.quantity;

    return {
      remainingBalance: totalCost,
      adjustedInstallment,
    };
  });

  let dueDateTemp = startDate;
  let isFirst = true;

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

    const dueDate =
      agreement === Agreement.FIFTEEN_AND_LAST
        ? getNextFortnight(dueDateTemp)
        : getNextSaturday(dueDateTemp, agreement, isFirst);

    payments.push({
      contract: { id: contractId },
      dueDate: dueDate.toISOString(),
      installmentAmount: periodPayment,
      debt: isFirst
        ? products.reduce((sum, prod) => sum + prod.price * prod.quantity, 0)
        : undefined,
    });

    dueDateTemp = dueDate;
    isFirst = false;
  }

  return payments;
}
