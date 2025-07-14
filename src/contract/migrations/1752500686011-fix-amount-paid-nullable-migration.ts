import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAmountPaidNullableMigration1752500686011
  implements MigrationInterface
{
  name = 'FixAmountPaidNullableMigration1752500686011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_payment" ALTER COLUMN "amount_paid" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_payment" ALTER COLUMN "amount_paid" SET NOT NULL`,
    );
  }
}
