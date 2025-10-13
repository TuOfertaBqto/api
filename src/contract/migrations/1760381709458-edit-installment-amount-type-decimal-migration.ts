import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditInstallmentAmountTypeDecimalMigration1760381709458
  implements MigrationInterface
{
  name = 'EditInstallmentAmountTypeDecimalMigration1760381709458';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "contract_product"
      ALTER COLUMN "installment_amount" TYPE numeric(10,2)
      USING "installment_amount"::numeric;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "contract_product"
      ALTER COLUMN "installment_amount" TYPE integer
      USING ROUND("installment_amount")::integer;
    `);
  }
}
