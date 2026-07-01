import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/types';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { TopicsService } from 'src/topics/topics.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly topicsService: TopicsService,
  ) {}

  @ApiOperation({ summary: 'List all subjects for the current user' })
  @ApiResponse({ status: 200, description: 'Subjects retrieved successfully.' })
  @Get()
  getAll(@CurrentUser() user: JwtPayload) {
    return this.subjectsService.findAll(user.sub);
  }

  @ApiOperation({ summary: 'Get a single subject by id' })
  @ApiParam({ name: 'id', description: 'UUID of the subject' })
  @ApiResponse({ status: 200, description: 'Subject retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @Get(':id')
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.subjectsService.findOne(user.sub, id);
  }

  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: 201, description: 'Subject created successfully.' })
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() data: CreateSubjectDto) {
    return this.subjectsService.create(user.sub, data);
  }

  @ApiOperation({ summary: 'Update an existing subject' })
  @ApiParam({ name: 'id', description: 'UUID of the subject' })
  @ApiResponse({ status: 200, description: 'Subject updated successfully.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() data: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(user.sub, id, data);
  }

  @ApiOperation({ summary: 'Delete a subject' })
  @ApiParam({ name: 'id', description: 'UUID of the subject' })
  @ApiResponse({ status: 200, description: 'Subject deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Subject not found.' })
  @Delete(':id')
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.subjectsService.delete(user.sub, id);
  }

  @ApiOperation({ summary: 'List all topics belonging to a subject' })
  @ApiParam({ name: 'id', description: 'UUID of the subject' })
  @ApiResponse({ status: 200, description: 'Topics retrieved successfully.' })
  @Get(':id/topics')
  getTopicsBySubject(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.topicsService.getTopicsBySubject(user.sub, id);
  }

  @ApiOperation({
    summary: 'Generate an AI-powered learning roadmap for a subject',
  })
  @ApiParam({ name: 'id', description: 'UUID of the subject' })
  @ApiResponse({ status: 200, description: 'Roadmap generated successfully.' })
  @Get(':id/roadmap')
  generateRoadmap(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.topicsService.generateRoadmapBySubject(user.sub, id);
  }
}
