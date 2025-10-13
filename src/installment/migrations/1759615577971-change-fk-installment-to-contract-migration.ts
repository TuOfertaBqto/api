import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeFkInstallmentToContractMigration1759615577971
  implements MigrationInterface
{
  name = 'ChangeFkInstallmentToContractMigration1759615577971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "installment" DROP CONSTRAINT "FK_7f362463433cf5ddce567dbe0f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment" ADD CONSTRAINT "FK_39194921db4a18969ff0c180c8f" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "installment" DROP CONSTRAINT "FK_39194921db4a18969ff0c180c8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "installment" ADD CONSTRAINT "FK_7f362463433cf5ddce567dbe0f1" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
