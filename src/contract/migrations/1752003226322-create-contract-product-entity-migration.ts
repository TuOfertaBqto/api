import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContractProductEntityMigration1752003226322
  implements MigrationInterface
{
  name = 'CreateContractProductEntityMigration1752003226322';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contract_product_status_enum" AS ENUM('to_buy', 'to_dispatch', 'dispatched')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contract_product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "delivery_date" TIMESTAMP NOT NULL, "status" "public"."contract_product_status_enum" NOT NULL DEFAULT 'to_buy', "contract_id" uuid, "product_id" uuid, CONSTRAINT "PK_e1add3c6809fa475189c15b4c99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_product" ADD CONSTRAINT "FK_cf2d0af283de31e01ebc95b18c4" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_product" ADD CONSTRAINT "FK_8192854078c1566cfce21bef5ce" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_product" DROP CONSTRAINT "FK_8192854078c1566cfce21bef5ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_product" DROP CONSTRAINT "FK_cf2d0af283de31e01ebc95b18c4"`,
    );
    await queryRunner.query(`DROP TABLE "contract_product"`);
    await queryRunner.query(
      `DROP TYPE "public"."contract_product_status_enum"`,
    );
  }
}
