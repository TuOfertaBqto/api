import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceAndInstallmentAmountContractProductMigration1757004175485
  implements MigrationInterface
{
  name = 'AddPriceAndInstallmentAmountContractProductMigration1757004175485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_product" ADD "price" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_product" ADD "installment_amount" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_product" DROP COLUMN "installment_amount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_product" DROP COLUMN "price"`,
    );
  }
}
