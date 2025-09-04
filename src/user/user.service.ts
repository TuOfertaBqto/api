import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
import {
  ResponseUserDTO,
  UpdateUserDTO,
  UserDTO,
  VendorStatsDTO,
} from './dto/user.dto';

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

  async findAll(role?: UserRole): Promise<User[]> {
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

    return users as User[];
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

  async getVendorsWithContractsStats(): Promise<VendorStatsDTO[]> {
    return this.userRepository
      .createQueryBuilder('vendor')
      .leftJoin('vendor.contracts', 'contract')
      .where('vendor.code IS NOT NULL')
      .select('vendor.id', 'id')
      .addSelect('vendor.code', 'code')
      .addSelect("vendor.firstName || ' ' || vendor.lastName", 'vendorName')
      .addSelect(
        `COUNT(CASE 
        WHEN contract.startDate IS NOT NULL 
         AND contract.endDate IS NULL 
         AND contract.deletedAt IS NULL
        THEN 1 END)`,
        'activeContracts',
      )
      .addSelect(
        `COUNT(CASE 
        WHEN contract.startDate IS NULL 
         AND contract.status = 'approved' 
         AND contract.deletedAt IS NULL
        THEN 1 END)`,
        'pendingContracts',
      )
      .addSelect(
        `COUNT(CASE 
        WHEN contract.status = 'canceled' 
         AND contract.deletedAt IS NULL
        THEN 1 END)`,
        'cancelledContracts',
      )
      .addSelect(
        `COUNT(CASE 
        WHEN contract.endDate IS NOT NULL
         AND contract.deletedAt IS NULL
        THEN 1 END)`,
        'finishedContracts',
      )
      .groupBy('vendor.id')
      .orderBy('vendor.firstName')
      .addOrderBy('vendor.lastName')
      .getRawMany();
  }
}
