import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from './auth.schema';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthCredentialsDto } from './dto/authCredentials.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthLogService } from './authLog.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Auth.name)
    private readonly authModel: Model<AuthDocument>,
    private readonly jwtService: JwtService,
    private readonly authLogService: AuthLogService,
  ) {}

  private async _logUserAction(params: {
    user: AuthDocument;
    action: 'login' | 'logout';
    tokenName: string;
  }) {
    const { user, action, tokenName } = params;

    const logData: any = {
      userId: user.userId,
      username: user.username,
      role: user.role,
      action,
      ipAddress: '0.0.0.0',
      tokenName,
    };

    if (action === 'login') {
      logData.loginTime = new Date();
    } else {
      logData.logoutTime = new Date();
    }

    await this.authLogService.createLog(logData);
  }

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    this.logger.log('signUp: ', createUserDto);
    const savedUser = await this.createUser(createUserDto);

    await this._logUserAction({
      user: savedUser,
      action: 'login',
      tokenName: 'signup-auto',
    });

    return savedUser.toObject();
  }

  async createUser(createUserDto: CreateUserDto): Promise<AuthDocument> {
    const { email, password, username, role } = createUserDto;

    const user = new this.authModel({
      email,
      password,
      username,
      role,
    });

    try {
      const savedUser = await user.save();
      return savedUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Username or email already exists');
      } else {
        this.logger.error('Error during user registration', error);
        throw new InternalServerErrorException('Registration failed');
      }
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; user: any }> {
    const { email, password } = authCredentialsDto;
    const user = await this.authModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email, id: user.id };
      const accessToken: string = await this.jwtService.sign(payload);

      await this._logUserAction({
        user,
        action: 'login',
        tokenName: 'signin',
      });

      return { accessToken, user: user.toObject() };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async logout(userId: string): Promise<void> {
    const user = await this.authModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    await this._logUserAction({
      user,
      action: 'logout',
      tokenName: 'logout',
    });
  }

  async findUserById(id: string): Promise<any> {
    const user = await this.authModel.findById(id).exec();
    return user ? user.toObject() : null;
  }

  async findUserByUsername(username: string): Promise<any[]> {
    const users = await this.authModel.find({
      username: { $regex: username, $options: 'i' },
    });

    if (!users || users.length === 0) {
      throw new HttpException('No users found', HttpStatus.NOT_FOUND);
    }

    return users.map((u) => u.toObject());
  }
}
