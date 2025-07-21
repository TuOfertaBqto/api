import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDebtToContractPaymentMigration1752584626226
  implements MigrationInterface
{
  name = 'AddDebtToContractPaymentMigration1752584626226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_payment" ADD "debt" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_payment" DROP COLUMN "debt"`,
    );
  }
}
