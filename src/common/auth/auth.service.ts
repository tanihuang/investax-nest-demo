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
import { Auth } from './auth.schema';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthCredentialsDto } from './dto/authCredentials.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Auth.name)
    private readonly authModel: Model<Auth>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<Auth> {
    this.logger.error('signUp: ', createUserDto);
    return this.createUser(createUserDto);
  }

  async createUser(createUserDto: CreateUserDto): Promise<Auth> {
    const { email, password, username, role } = createUserDto;

    // Hash the password
    // const salt = await bcrypt.genSalt();
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user document
    const user = new this.authModel({
      email,
      password,
      username,
      role,
    });

    try {
      console.log('User registered successfully');
      const savedUser = await user.save();
      return savedUser.toObject();
    } catch (error) {
      // Handle duplicate username error
      if (error.code === 11000) {
        throw new ConflictException('Username already exists');
      } else {
        this.logger.error('Error during user registration', error);
        throw new InternalServerErrorException('Registration failed');
      }
    }
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; user: Auth }> {
    const { email, password } = authCredentialsDto;
    const user = await this.authModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email, id: user.id };
      const accessToken: string = await this.jwtService.sign(payload);
      return { accessToken, user: user.toObject() };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async findUserById(id: string): Promise<Auth | null> {
    return this.authModel.findById(id).exec();
  }

  async findUserByUsername(username: string): Promise<Auth> {
    const user: any = await this.authModel.find({
      username: { $regex: username, $options: 'i' },
    });
    if (!user) {
      throw new HttpException('No users found', HttpStatus.NOT_FOUND);
    }
    return user.map((user) => user.toObject());
  }
}
