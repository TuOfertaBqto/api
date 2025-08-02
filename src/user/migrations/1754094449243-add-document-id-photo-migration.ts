import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentIdPhotoMigration1754094449243
  implements MigrationInterface
{
  name = 'AddDocumentIdPhotoMigration1754094449243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "document_id_photo" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "document_id_photo"`,
    );
  }
}
