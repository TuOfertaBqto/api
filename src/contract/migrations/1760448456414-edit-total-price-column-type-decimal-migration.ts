import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditTotalPriceColumnTypeDecimalMigration1760448456414
  implements MigrationInterface
{
  name = 'EditTotalPriceColumnTypeDecimalMigration1760448456414';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "contract"
      ALTER COLUMN "total_price" TYPE numeric(10,2)
      USING "total_price"::numeric(10,2);
    `);

    await queryRunner.query(`
      ALTER TABLE "contract"
      ALTER COLUMN "total_price" SET DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE "contract"
      ALTER COLUMN "total_price" SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "contract"
      ALTER COLUMN "total_price" TYPE integer
      USING round("total_price")::integer;
    `);

    await queryRunner.query(`
      ALTER TABLE "contract"
      ALTER COLUMN "total_price" SET DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE "contract"
      ALTER COLUMN "total_price" SET NOT NULL;
    `);
  }
}
