import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeliveryDateNulleableMigration1752004924838
  implements MigrationInterface
{
  name = 'DeliveryDateNulleableMigration1752004924838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_product" ALTER COLUMN "delivery_date" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_product" ALTER COLUMN "delivery_date" SET NOT NULL`,
    );
  }
}
