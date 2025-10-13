import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceAndInstallmentAmountDecimalMigration1760380645547
  implements MigrationInterface
{
  name = 'AddPriceAndInstallmentAmountDecimalMigration1760380645547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product"
      ALTER COLUMN "price" TYPE numeric(10,2)
      USING "price"::numeric;
    `);
    await queryRunner.query(`
      ALTER TABLE "product"
      ALTER COLUMN "installment_amount" TYPE numeric(10,2)
      USING "installment_amount"::numeric;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product"
      ALTER COLUMN "price" TYPE integer
      USING ROUND("price")::integer;
    `);
    await queryRunner.query(`
      ALTER TABLE "product"
      ALTER COLUMN "installment_amount" TYPE integer
      USING ROUND("installment_amount")::integer;
    `);
  }
}
