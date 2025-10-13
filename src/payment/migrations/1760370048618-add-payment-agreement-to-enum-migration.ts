import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentAgreementToEnumMigration1760370048618
  implements MigrationInterface
{
  name = 'AddPaymentAgreementToEnumMigration1760370048618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."payment_type_unique_enum" RENAME TO "payment_type_unique_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_type_unique_enum" AS ENUM('zelle', 'paypal', 'binance', 'mobile_payment', 'bank_transfer', 'cash', 'discount', 'payment_agreement')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "type" TYPE "public"."payment_type_unique_enum" USING "type"::"text"::"public"."payment_type_unique_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."payment_type_unique_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payment_type_unique_enum_old" AS ENUM('zelle', 'paypal', 'binance', 'mobile_payment', 'bank_transfer', 'cash', 'discount')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "type" TYPE "public"."payment_type_unique_enum_old" USING "type"::"text"::"public"."payment_type_unique_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payment_type_unique_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payment_type_unique_enum_old" RENAME TO "payment_type_unique_enum"`,
    );
  }
}
