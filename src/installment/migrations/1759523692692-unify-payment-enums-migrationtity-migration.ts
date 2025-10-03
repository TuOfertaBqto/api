import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyPaymentEnumsMigrationtityMigrationn1759523692692
  implements MigrationInterface
{
  name = 'UnifyPaymentEnumsMigrationtityMigrationn1759523692692';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "installment"
    ALTER COLUMN "payment_method" TYPE "payment_type_enum"
    USING "payment_method"::text::payment_type_enum
  `);

    await queryRunner.query(`
    DROP TYPE IF EXISTS "installment_payment_method_enum"
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE TYPE "installment_payment_method_enum" AS ENUM (
      'zelle', 'paypal', 'binance', 'mobile_payment',
      'bank_transfer', 'cash', 'discount'
    )
  `);

    await queryRunner.query(`
    ALTER TABLE "installment"
    ALTER COLUMN "payment_method" TYPE "installment_payment_method_enum"
    USING "payment_method"::text::installment_payment_method_enum
  `);
  }
}
