import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditInstallmentAmountColumnMigration1760391595156
  implements MigrationInterface
{
  name = 'EditInstallmentAmountColumnMigration1760391595156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "installment"
      ALTER COLUMN "installment_amount"
      TYPE numeric(10,2)
      USING "installment_amount"::numeric;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "installment"
      ALTER COLUMN "installment_amount"
      TYPE integer
      USING ROUND("installment_amount")::integer;
    `);
  }
}
