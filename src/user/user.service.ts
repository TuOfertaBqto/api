import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ResponseUserDTO, UpdateUserDTO, UserDTO } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getNextAvailableCode(): Promise<string> {
    const lastUser = await this.userRepository
      .createQueryBuilder('user')
      .where('user.code IS NOT NULL')
      .orderBy('CAST(user.code AS INTEGER)', 'DESC')
      .getOne();

    const lastCode = lastUser?.code ? parseInt(lastUser.code, 10) : 0;
    return String(lastCode + 1);
  }

  async findAll(): Promise<ResponseUserDTO[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<ResponseUserDTO | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(userData: UserDTO): Promise<ResponseUserDTO> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(
    id: string,
    updateUser: UpdateUserDTO,
  ): Promise<ResponseUserDTO | null> {
    await this.userRepository.update(id, updateUser);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.softDelete(id);
  }
}
