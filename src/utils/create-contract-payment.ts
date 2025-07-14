import { CreateContractPaymentDTO } from 'src/contract/dto/contract-payment.dto';

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

// export function generatePayments(
//   contractId: string,
//   installmentAmount: number,
//   agreement: 'weekly' | 'fortnightly',
//   startDate: Date,
// ): CreateContractPaymentDTO[] {
//   const payments: CreateContractPaymentDTO[] = [];
//   const intervalDays = agreement === 'weekly' ? 7 : 14;

//   for (let i = 0; i < installmentAmount; i++) {
//     const dueDate = new Date(startDate);
//     dueDate.setDate(startDate.getDate() + i * intervalDays);

//     payments.push({
//       contractId,
//       dueDate: dueDate.toISOString(),
//     });
//   }

//   return payments;
// }

export function generatePayments(
  contractId: string,
  totalPrice: number,
  installmentAmount: number,
  agreement: 'weekly' | 'fortnightly',
  startDate: Date,
): CreateContractPaymentDTO[] {
  const payments: CreateContractPaymentDTO[] = [];

  const intervalDays = agreement === 'weekly' ? 7 : 14;

  const totalInstallments = Math.ceil(totalPrice / installmentAmount);

  for (let i = 0; i < totalInstallments; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + i * intervalDays);

    payments.push({
      contract: { id: contractId },
      dueDate: dueDate.toISOString(),
    });
  }

  return payments;
}
