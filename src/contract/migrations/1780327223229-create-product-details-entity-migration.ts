import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductDetailsEntityMigration1780327223229
  implements MigrationInterface
{
  name = 'CreateProductDetailsEntityMigration1780327223229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "serial_number" character varying NOT NULL, "is_new" boolean NOT NULL DEFAULT true, "cp_id" uuid, CONSTRAINT "PK_a3fa8e2e94f3c37a8d731451de4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_details" ADD CONSTRAINT "FK_846dfc14458519184bee7613554" FOREIGN KEY ("cp_id") REFERENCES "contract_product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_details" DROP CONSTRAINT "FK_846dfc14458519184bee7613554"`,
    );
    await queryRunner.query(`DROP TABLE "product_details"`);
  }
}
