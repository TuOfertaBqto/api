import { CreateContractPaymentDTO } from 'src/contract/dto/contract-payment.dto';

export function getNextSaturday(fromDate: Date): Date {
  const date = new Date(fromDate);
  const day = date.getDay();
  const diff = day === 6 ? 7 : 6 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function generatePayments(
  contractId: string,
  installmentAmount: number,
  agreement: 'weekly' | 'fortnightly',
  startDate: Date,
): CreateContractPaymentDTO[] {
  const payments: CreateContractPaymentDTO[] = [];
  const intervalDays = agreement === 'weekly' ? 7 : 14;

  for (let i = 0; i < installmentAmount; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + i * intervalDays);

    payments.push({
      contractId,
      dueDate: dueDate.toISOString(),
    });
  }

  return payments;
}
