import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/types';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get('me')
  getUserProfile(@CurrentUser() currentUser: JwtPayload) {
    return this.userService.getUserInfo(currentUser.sub);
  }

  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the email and/or name of the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Patch('me')
  updateUserProfile(
    @CurrentUser() currentUser: JwtPayload,
    @Body() data: UpdateUserDto,
  ) {
    return this.userService.updateUserProfile(currentUser.sub, data);
  }

  @ApiOperation({
    summary: 'Update current user password',
    description: 'Updates the password for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User password updated successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or wrong password.' })
  @Patch('me/password')
  updateUserPassword(
    @CurrentUser() currentUser: JwtPayload,
    @Body() data: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(currentUser.sub, data);
  }

  @ApiOperation({
    summary: 'Delete current user',
    description: 'Deletes the authenticated user account.',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Delete('me')
  deleteUser(@CurrentUser() currentUser: JwtPayload) {
    return this.userService.deleteUser(currentUser.sub);
  }
}
