import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePaidAtNullableMigration1759616821145
  implements MigrationInterface
{
  name = 'ChangePaidAtNullableMigration1759616821145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."payment_type_enum" RENAME TO "payment_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_type_unique_enum" AS ENUM('zelle', 'paypal', 'binance', 'mobile_payment', 'bank_transfer', 'cash', 'discount')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "type" TYPE "public"."payment_type_unique_enum" USING "type"::"text"::"public"."payment_type_unique_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payment_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "paid_at" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "paid_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_type_enum_old" AS ENUM('bank_transfer', 'binance', 'cash', 'discount', 'mobile_payment', 'paypal', 'zelle')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "type" TYPE "public"."payment_type_enum_old" USING "type"::"text"::"public"."payment_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."payment_type_unique_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."payment_type_enum_old" RENAME TO "payment_type_enum"`,
    );
  }
}
