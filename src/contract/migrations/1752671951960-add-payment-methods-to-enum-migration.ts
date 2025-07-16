import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodsToEnumMigration1752671951960
  implements MigrationInterface
{
  name = 'AddPaymentMethodsToEnumMigration1752671951960';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."contract_payment_payment_method_enum" RENAME TO "contract_payment_payment_method_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contract_payment_payment_method_enum" AS ENUM('zelle', 'paypal', 'binance', 'mobile_payment', 'bank_transfer', 'cash')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_payment" ALTER COLUMN "payment_method" TYPE "public"."contract_payment_payment_method_enum" USING "payment_method"::"text"::"public"."contract_payment_payment_method_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contract_payment_payment_method_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contract_payment_payment_method_enum_old" AS ENUM('zelle', 'mobile_payment', 'bank_transfer', 'cash')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_payment" ALTER COLUMN "payment_method" TYPE "public"."contract_payment_payment_method_enum_old" USING "payment_method"::"text"::"public"."contract_payment_payment_method_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contract_payment_payment_method_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."contract_payment_payment_method_enum_old" RENAME TO "contract_payment_payment_method_enum"`,
    );
  }
}
