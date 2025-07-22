import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthLog, AuthLogSchema } from './authLog.schema';
import { AuthLogService } from './authLog.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuthLog.name, schema: AuthLogSchema }]),
  ],
  providers: [AuthLogService],
  exports: [AuthLogService],
})
export class AuthLogModule {}
