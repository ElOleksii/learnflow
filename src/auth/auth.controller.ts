import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new account and returns a JWT access token.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully; returns an access token.',
  })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: 'Log in',
    description: 'Authenticates a user and returns a JWT access token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful; returns an access token.',
  })
  @ApiResponse({ status: 401, description: 'Incorrect credentials.' })
  @HttpCode(200)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
