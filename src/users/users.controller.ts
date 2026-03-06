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
import type { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  getUserProfile(@CurrentUser() currentUser: JwtPayload) {
    return this.userService.getUserInfo(currentUser.sub);
  }

  @Patch('me')
  updateUserProfile(
    @CurrentUser() currentUser: JwtPayload,
    @Body() data: UpdateUserDto,
  ) {
    return this.userService.updateUserProfile(currentUser.sub, data);
  }

  @Patch('me/password')
  updateUserPassword(
    @CurrentUser() currentUser: JwtPayload,
    @Body() data: UpdatePasswordDto,
  ) {
    return this.userService.updatePassowrd(currentUser.sub, data);
  }

  @Delete('me')
  deleteUser(@CurrentUser() currentUser: JwtPayload) {
    return this.userService.deleteUser(currentUser.sub);
  }
}
