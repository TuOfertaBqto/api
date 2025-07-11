import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuantityToContractProductEntityMigration1752084591625 implements MigrationInterface {
    name = 'AddQuantityToContractProductEntityMigration1752084591625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contract_product" ADD "quantity" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contract_product" DROP COLUMN "quantity"`);
    }

}
