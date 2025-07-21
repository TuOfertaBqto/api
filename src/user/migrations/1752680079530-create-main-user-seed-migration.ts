import { MigrationInterface, QueryRunner } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';

config();

export class CreateMainUserSeedMigration1752680079530
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const firstName = process.env.SEED_USER_FIRST_NAME;
    const lastName = process.env.SEED_USER_LAST_NAME;
    const documentId = process.env.SEED_USER_DOCUMENT_ID;
    const email = process.env.SEED_USER_EMAIL?.toLocaleLowerCase();
    const phoneNumber = process.env.SEED_USER_PHONE_NUMBER;
    const password = process.env.SEED_USER_PASSWORD;
    const role = process.env.SEED_USER_ROLE;
    const adress = process.env.SEED_USER_ADRESS;

    if (!password) {
      throw new Error('SEED_USER_PASSWORD environment variable is not set');
    }
    const passwordHash = await bcrypt.hash(password, 10);

    await queryRunner.query(`
      INSERT INTO "user" ( first_name, last_name, document_id, email, phone_number, password, role, adress)
      VALUES (
        '${firstName}',
        '${lastName}',
        '${documentId}',
        '${email}',
        '${phoneNumber}',
        '${passwordHash}',
        '${role}',
        '${adress}'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const email = process.env.SEED_USER_EMAIL?.toLocaleLowerCase();

    await queryRunner.query(`
      DELETE FROM "user" WHERE email = '${email}'
    `);
  }
}
