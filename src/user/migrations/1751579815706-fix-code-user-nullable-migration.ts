import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCodeUserNullableMigration1751579815706
  implements MigrationInterface
{
  name = 'FixCodeUserNullableMigration1751579815706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "code" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "code" SET NOT NULL`,
    );
  }
}
