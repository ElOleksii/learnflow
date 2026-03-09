import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(userId: string) {
    const subjects = await this.prismaService.subject.findMany({
      where: { userId },
    });

    return subjects;
  }

  async findOne(userId: string, subjectId: string) {
    const subject = await this.prismaService.subject.findUnique({
      where: { id: subjectId, userId },
      include: {
        topics: true,
      },
    });

    if (!subject) {
      throw new NotFoundException();
    }

    return subject;
  }

  async createSubject(userId: string, data: CreateSubjectDto) {
    return await this.prismaService.subject.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async updateSubject(
    userId: string,
    subjectId: string,
    data: UpdateSubjectDto,
  ) {
    const subject = await this.prismaService.subject.findUnique({
      where: { id: subjectId, userId },
    });

    if (!subject) {
      throw new NotFoundException();
    }

    return this.prismaService.subject.update({
      where: {
        id: subjectId,
        userId,
      },
      data,
    });
  }

  async deleteSubject(userId: string, subjectId: string) {
    await this.prismaService.subject.delete({
      where: {
        id: subjectId,
        userId,
      },
    });

    return { message: 'Deleted successfully' };
  }
}
