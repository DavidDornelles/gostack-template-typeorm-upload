import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class CreateForeignKey1619406350936
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['category_id'],
        name: 'TransactionCategory',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'TransactionCategory');
  }
}
