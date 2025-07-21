import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductInventoryUniqueMigration1752329339883
  implements MigrationInterface
{
  name = 'AddProductInventoryUniqueMigration1752329339883';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "UQ_732fdb1f76432d65d2c136340dc" UNIQUE ("product_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "UQ_732fdb1f76432d65d2c136340dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
