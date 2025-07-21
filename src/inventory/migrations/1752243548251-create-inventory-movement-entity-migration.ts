import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInventoryMovementEntityMigration1752243548251
  implements MigrationInterface
{
  name = 'CreateInventoryMovementEntityMigration1752243548251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_movement_movement_type_enum" AS ENUM('in', 'out')`,
    );
    await queryRunner.query(
      `CREATE TABLE "inventory_movement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "movement_type" "public"."inventory_movement_movement_type_enum" NOT NULL, "quantity" integer NOT NULL, "inventory_id" uuid, CONSTRAINT "PK_e17362693c889da517444ad8fb5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "inventory_movement" ADD CONSTRAINT "FK_74fa1a5f453f11694f77c036004" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_movement" DROP CONSTRAINT "FK_74fa1a5f453f11694f77c036004"`,
    );
    await queryRunner.query(`DROP TABLE "inventory_movement"`);
    await queryRunner.query(
      `DROP TYPE "public"."inventory_movement_movement_type_enum"`,
    );
  }
}
