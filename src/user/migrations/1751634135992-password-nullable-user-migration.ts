import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordNullableUserMigration1751634135992 implements MigrationInterface {
    name = 'PasswordNullableUserMigration1751634135992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
    }

}
