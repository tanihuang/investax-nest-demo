import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLogService } from './authLog.service';
import { Auth, AuthSchema } from './auth.schema'; // ✅ 匯入 schema
import { JwtModule } from '@nestjs/jwt';
import { AuthLogModule } from './authLog.module';

@Module({
  imports: [
    AuthLogModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'dev'}`],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get('DB_USER')}:${configService.get('DB_PASSWORD')}@${configService.get('DB_HOST')}/?retryWrites=true&w=majority&appName=Cluster0`,
        dbName: configService.get('DB_NAME'),
      }),
    }),
    // ✅ 註冊 Auth schema 給 Mongoose
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),

    // ✅ JWT 模組（用於登入）
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
