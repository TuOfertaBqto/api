import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateContractMigration1751907594544
  implements MigrationInterface
{
  name = 'CreateContractMigration1751907594544';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."contract_agreement_enum" AS ENUM('monthly', 'quarterly')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contract" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "request_date" TIMESTAMP NOT NULL, "start_date" TIMESTAMP, "end_date" TIMESTAMP, "installment_amount" integer NOT NULL DEFAULT '0', "agreement" "public"."contract_agreement_enum" NOT NULL, "total_price" integer NOT NULL DEFAULT '0', "vendor_id" uuid, "customer_id" uuid, CONSTRAINT "PK_17c3a89f58a2997276084e706e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_17596e63dd2fb6f40ed76b0dada" FOREIGN KEY ("vendor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" ADD CONSTRAINT "FK_abdcabff39fa6c1acbb67d69a03" FOREIGN KEY ("customer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_abdcabff39fa6c1acbb67d69a03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract" DROP CONSTRAINT "FK_17596e63dd2fb6f40ed76b0dada"`,
    );
    await queryRunner.query(`DROP TABLE "contract"`);
    await queryRunner.query(`DROP TYPE "public"."contract_agreement_enum"`);
  }
}
