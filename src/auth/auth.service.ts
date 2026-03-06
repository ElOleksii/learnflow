import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async register(data: RegisterDto) {
    const { email, name, password } = data;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (user) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds =
      this.configService.getOrThrow<number>('BCRYPT_SALT_ROUNDS');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    const payload = { sub: createdUser.id, name: createdUser.name };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Incorrect credentials');
    }

    const { password: hashedPassword } = user;

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (!isMatch) {
      throw new UnauthorizedException('Incorrect credentials');
    }

    const payload = { sub: user.id, name: user.name };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
