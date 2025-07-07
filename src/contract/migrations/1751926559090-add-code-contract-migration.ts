import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeContractMigration1751926559090
  implements MigrationInterface
{
  name = 'AddCodeContractMigration1751926559090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" ADD "code" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "UQ_a167b5ec6a7dd9cd577bd622d82" UNIQUE ("code")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "UQ_a167b5ec6a7dd9cd577bd622d82"`,
    );
    await queryRunner.query(`ALTER TABLE "contract" DROP COLUMN "code"`);
  }
}
