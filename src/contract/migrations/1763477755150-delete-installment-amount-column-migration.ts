import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteInstallmentAmountColumnMigration1763477755150
  implements MigrationInterface
{
  name = 'DeleteInstallmentAmountColumnMigration1763477755150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP COLUMN "installment_amount"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" ADD "installment_amount" integer NOT NULL DEFAULT '0'`,
    );
  }
}
