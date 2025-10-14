import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditPriceColumnTypeDecimalContractProductMigration1760449333894
  implements MigrationInterface
{
  name = 'EditPriceColumnTypeDecimalContractProductMigration1760449333894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "contract_product"
      ALTER COLUMN "price" TYPE numeric(10,2)
      USING "price"::numeric(10,2);
    `);

    await queryRunner.query(`
      ALTER TABLE "contract_product"
      ALTER COLUMN "price" SET DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE "contract_product"
      ALTER COLUMN "price" SET NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "contract_product"
      ALTER COLUMN "price" TYPE integer
      USING round("price")::integer;
    `);

    await queryRunner.query(`
      ALTER TABLE "contract_product"
      ALTER COLUMN "price" SET DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE "contract_product"
      ALTER COLUMN "price" SET NOT NULL;
    `);
  }
}
