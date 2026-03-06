import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getUserInfo(userId: string) {
    const userInfo = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, streakDays: true },
    });

    return userInfo;
  }

  async updateUserProfile(userId: string, data: UpdateUserDto) {
    const { email: newEmail, name: newName } = data;

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (newEmail) {
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email: newEmail,
        },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email is already taken');
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...(newEmail && { email: newEmail }),
        ...(newName && { name: newName }),
      },
      select: {
        email: true,
        name: true,
      },
    });

    const { email, name } = updatedUser;

    return { email, name };
  }

  async updatePassowrd(userId: string, data: UpdatePasswordDto) {
    const { oldPassword, newPassword } = data;

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPassMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPassMatch) {
      throw new UnauthorizedException('Passwords do not match');
    }

    const saltRounds =
      this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS');
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    return { message: 'Password updated successfully' };
  }

  async deleteUser(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prismaService.user.delete({
      where: { id: userId },
    });

    return { message: 'User was deleted successfully' };
  }
}
