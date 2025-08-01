import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
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

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new BadRequestException('Invalid request');
    }
    return user;
  }

  async findAll(role?: UserRole): Promise<ResponseUserDTO[]> {
    let users;

    if (role === UserRole.VENDOR) {
      users = await this.userRepository.find({
        where: [{ role: UserRole.VENDOR }, { code: Not(IsNull()) }],
      });
    } else if (role) {
      users = await this.userRepository.find({
        where: { role },
      });
    } else {
      users = await this.userRepository.find();
    }

    return users as ResponseUserDTO[];
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
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
