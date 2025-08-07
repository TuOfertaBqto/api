import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstallmentAmountMigration1754578959013
  implements MigrationInterface
{
  name = 'AddInstallmentAmountMigration1754578959013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "installment_amount" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "installment_amount"`,
    );
  }
}
