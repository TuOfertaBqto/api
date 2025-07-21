import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryEntityMigration1752239676577
  implements MigrationInterface
{
  name = 'CreateInventoryEntityMigration1752239676577';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "stock_quantity" integer NOT NULL DEFAULT '0', "product_id" uuid, CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`,
    );
    await queryRunner.query(`DROP TABLE "inventory"`);
  }
}
