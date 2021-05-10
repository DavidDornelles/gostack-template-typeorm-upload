import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);

    const transaction = await transactionRepository.findOne({
      where: {
        id,
      },
    });

    if (!transaction) {
      throw new AppError('No transaction found');
    }

    const deletedTransaction = await transactionRepository.remove(transaction);

    return deletedTransaction;
  }
}

export default DeleteTransactionService;
