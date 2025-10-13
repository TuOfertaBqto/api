import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameContractPaymentToInstallmentMigration1759615092403
  implements MigrationInterface
{
  name = 'RenameContractPaymentToInstallmentMigration1759615092403';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_payment" RENAME TO "installment"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "installment" RENAME TO "contract_payment"`,
    );
  }
}
