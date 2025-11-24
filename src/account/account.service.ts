import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { CreateAccountDTO, UpdateAccountDTO } from './dto/account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  create(dto: CreateAccountDTO) {
    const account = this.accountRepository.create(dto);
    return this.accountRepository.save(account);
  }

  findAll() {
    return this.accountRepository.find();
  }

  async findOne(id: string) {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async update(id: string, dto: UpdateAccountDTO) {
    await this.findOne(id);
    await this.accountRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.accountRepository.softDelete(id);
  }
}
