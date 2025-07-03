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
