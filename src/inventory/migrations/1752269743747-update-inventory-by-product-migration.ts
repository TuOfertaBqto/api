import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateInventoryByProductMigration1752269743747
  implements MigrationInterface
{
  name = 'UpdateInventoryByProductMigration1752269743747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_movement" DROP CONSTRAINT "FK_74fa1a5f453f11694f77c036004"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movement" RENAME COLUMN "inventory_id" TO "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movement" ADD CONSTRAINT "FK_667e6082b57b76f2985091d89cf" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_movement" DROP CONSTRAINT "FK_667e6082b57b76f2985091d89cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movement" RENAME COLUMN "product_id" TO "inventory_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movement" ADD CONSTRAINT "FK_74fa1a5f453f11694f77c036004" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
