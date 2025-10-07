import { MigrationInterface, QueryRunner } from 'typeorm';
interface InstallmentRow {
  id: string;
  payment_method: string;
  reference_number: string | null;
  photo: string | null;
  owner: string | null;
  amount_paid: number;
  paid_at: Date | string | null;
}

export class MoveInstallmentsToPaymentsMigration1759845398626
  implements MigrationInterface
{
  name = 'MoveInstallmentsToPaymentsMigration1759845398626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const installments = (await queryRunner.query(`
      SELECT id, payment_method, reference_number, photo, owner, amount_paid, paid_at
      FROM installment
      WHERE amount_paid IS NOT NULL AND amount_paid > 0 AND deleted_at IS NULL
    `)) as InstallmentRow[];

    await queryRunner.startTransaction();
    try {
      const relations: {
        installment_id: string;
        payment_id: string;
        amount: number;
      }[] = [];

      for (const inst of installments) {
        const [payment] = (await queryRunner.query(
          `
          INSERT INTO payment (
            type,
            reference_number,
            photo,
            owner,
            amount,
            paid_at
          )
          VALUES (
            $1::text::payment_type_unique_enum,
            $2,
            $3,
            $4,
            $5,
            $6
          )
          RETURNING id
        `,
          [
            inst.payment_method,
            inst.reference_number,
            inst.photo,
            inst.owner,
            inst.amount_paid,
            inst.paid_at,
          ],
        )) as { id: string }[];

        relations.push({
          installment_id: inst.id,
          payment_id: payment.id,
          amount: inst.amount_paid,
        });
      }

      if (relations.length > 0) {
        const valuesSql = relations
          .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
          .join(', ');

        const params = relations.flatMap((r) => [
          r.installment_id,
          r.payment_id,
          r.amount,
        ]);

        await queryRunner.query(
          `
          INSERT INTO installment_payment (
            installment_id,
            payment_id,
            amount
          )
          VALUES ${valuesSql}
        `,
          params,
        );
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM payment
      WHERE id IN (
        SELECT payment_id FROM installment_payment
      )
    `);
    await queryRunner.query(`DELETE FROM installment_payment`);
  }
}
