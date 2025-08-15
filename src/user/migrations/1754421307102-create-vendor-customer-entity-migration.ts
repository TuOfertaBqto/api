import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVendorCustomerEntityMigration1754421307102
  implements MigrationInterface
{
  name = 'CreateVendorCustomerEntityMigration1754421307102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vendor_customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "vendor_id" uuid NOT NULL, "customer_id" uuid NOT NULL, CONSTRAINT "UQ_3b8c83faf6f286caa3929d88147" UNIQUE ("vendor_id", "customer_id"), CONSTRAINT "PK_149fc9049695fb33a6f3784025d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_customer" ADD CONSTRAINT "FK_3348fe9dd68b55c2b9db82e5379" FOREIGN KEY ("vendor_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_customer" ADD CONSTRAINT "FK_ce0498a198aff00e8ab9e98938d" FOREIGN KEY ("customer_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vendor_customer" DROP CONSTRAINT "FK_ce0498a198aff00e8ab9e98938d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_customer" DROP CONSTRAINT "FK_3348fe9dd68b55c2b9db82e5379"`,
    );
    await queryRunner.query(`DROP TABLE "vendor_customer"`);
  }
}
