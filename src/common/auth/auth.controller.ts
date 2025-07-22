import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthCredentialsDto } from './dto/authCredentials.dto';
import { Auth } from './auth.schema';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    this.logger.error('Error during user registration', createUserDto);
    return await this.authService.signUp(createUserDto);
  }

  @Post('/signin')
  async signIn(@Body() authCredentialsDto: AuthCredentialsDto) {
    return await this.authService.signIn(authCredentialsDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<Auth> {
    const user = await this.authService.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get('user/:username')
  async getUserByUsername(@Param('username') username: string): Promise<Auth> {
    return this.authService.findUserByUsername(username);
  }
}
