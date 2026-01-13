import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToUserMigration1767708032272
  implements MigrationInterface
{
  name = 'AddIsActiveToUserMigration1767708032272';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_active"`);
  }
}
