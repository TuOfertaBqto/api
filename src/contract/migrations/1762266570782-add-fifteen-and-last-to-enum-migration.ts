import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFifteenAndLastToEnumMigration1762266570782
  implements MigrationInterface
{
  name = 'AddFifteenAndLastToEnumMigration1762266570782';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."contract_agreement_enum" RENAME TO "contract_agreement_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contract_agreement_enum" AS ENUM('weekly', 'fortnightly', 'fifteen_and_last')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "agreement" TYPE "public"."contract_agreement_enum" USING "agreement"::"text"::"public"."contract_agreement_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."contract_agreement_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contract_agreement_enum_old" AS ENUM('fortnightly', 'weekly')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ALTER COLUMN "agreement" TYPE "public"."contract_agreement_enum_old" USING "agreement"::"text"::"public"."contract_agreement_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."contract_agreement_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."contract_agreement_enum_old" RENAME TO "contract_agreement_enum"`,
    );
  }
}
