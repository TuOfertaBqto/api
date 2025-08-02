import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultStatusPendingMigration1754161052673
  implements MigrationInterface
{
  name = 'AddDefaultStatusPendingMigration1754161052673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contract_status_enum" AS ENUM('canceled', 'pending', 'approved')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD "status" "public"."contract_status_enum" NOT NULL DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "contract" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."contract_status_enum"`);
  }
}
