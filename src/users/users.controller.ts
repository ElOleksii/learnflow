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
  ApiParam,
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
    description: 'Returns current user profile info.',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'UUID of the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrived successfully',
    type: Number,
  })
  @Get('me')
  getUserProfile(@CurrentUser() currentUser: JwtPayload) {
    return this.userService.getUserInfo(currentUser.sub);
  }

  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates email and/or name of the user.',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'UUID of the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UpdateUserDto,
  })
  @Patch('me')
  updateUserProfile(
    @CurrentUser() currentUser: JwtPayload,
    @Body() data: UpdateUserDto,
  ) {
    return this.userService.updateUserProfile(currentUser.sub, data);
  }

  @ApiOperation({
    summary: 'Update current user password',
    description: 'Update the password for the current user.',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'UUID of the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'User password was updated successfully',
    type: UpdatePasswordDto,
  })
  @Patch('me/password')
  updateUserPassword(
    @CurrentUser() currentUser: JwtPayload,
    @Body() data: UpdatePasswordDto,
  ) {
    return this.userService.updatePassowrd(currentUser.sub, data);
  }

  @ApiOperation({
    summary: 'Delete current user',
    description: 'Delete the current user account.',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: Number,
  })
  @Delete('me')
  deleteUser(@CurrentUser() currentUser: JwtPayload) {
    return this.userService.deleteUser(currentUser.sub);
  }
}
