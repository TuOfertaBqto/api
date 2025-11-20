import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccountMainMigration1763659937758
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO account (owner)
        VALUES ('Eivar Pérez'), ('Endrina Medina');
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.query(
      `DELETE FROM account WHERE owner IN ('Eivar Pérez', 'Endrina Medina')`,
    );
  }
}
