import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameContractPaymentToInstallmentMigration1759263736501
  implements MigrationInterface
{
  name = 'RenameContractPaymentToInstallmentMigration1759263736501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_payment" RENAME TO "installment"`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."contract_payment_payment_method_enum" RENAME TO "installment_payment_method_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."installment_payment_method_enum" RENAME TO "contract_payment_payment_method_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "installment" RENAME TO "contract_payment"`,
    );
  }
}
