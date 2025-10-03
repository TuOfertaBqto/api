import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePaidAtNullableMigration1759503581453
  implements MigrationInterface
{
  name = 'ChangePaidAtNullableMigration1759503581453';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "paid_at" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "paid_at" SET NOT NULL`,
    );
  }
}
