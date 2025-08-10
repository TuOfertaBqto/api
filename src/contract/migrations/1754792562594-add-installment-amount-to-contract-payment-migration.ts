import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstallmentAmountToContractPaymentMigration1754792562594
  implements MigrationInterface
{
  name = 'AddInstallmentAmountToContractPaymentMigration1754792562594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_payment" ADD "installment_amount" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_payment" DROP COLUMN "installment_amount"`,
    );
  }
}
