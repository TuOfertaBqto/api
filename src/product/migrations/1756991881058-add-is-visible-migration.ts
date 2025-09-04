import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVisibleMigration1756991881058 implements MigrationInterface {
  name = 'AddIsVisibleMigration1756991881058';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "is_visible" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_visible"`);
  }
}
