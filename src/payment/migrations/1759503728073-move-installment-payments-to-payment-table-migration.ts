import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveInstallmentPaymentsToPaymentTableMigration1759503728073
  implements MigrationInterface
{
  name = 'MoveInstallmentPaymentsToPaymentTableMigration1759503728073';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "payment" (
        type,
        reference_number,
        photo,
        owner,
        amount,
        paid_at
      )
      SELECT
        i.payment_method::text::payment_type_enum,
        i.reference_number,
        i.photo,
        i.owner,
        i.amount_paid,
        i.paid_at
      FROM "installment" i
      WHERE i.amount_paid IS NOT NULL; 
    `);
  }

  public async down(/*queryRunner: QueryRunner*/): Promise<void> {
    // OJO: este down simplemente elimina lo migrado
    //await queryRunner.query(`DELETE FROM "payment"`);
  }
}
