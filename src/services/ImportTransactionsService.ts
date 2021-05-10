import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface RequestDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const readCSVStream = fs.createReadStream(filePath);
    const parseStream = csvParse({
      from_line: 2,
    });
    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: RequestDTO[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });

      categories.push(category);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existentCategories = await categoriesRepository.find({
      where:{
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const allCategories = [...newCategories, ...existentCategories];

    const importedTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(
          category => category.title === transaction.title,
        ),
      })),
    );

    await transactionsRepository.save(importedTransactions);

    await fs.promises.unlink(filePath);

    return importedTransactions;
  }
}

export default ImportTransactionsService;
