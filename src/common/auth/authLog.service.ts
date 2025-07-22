import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthLog, AuthLogDocument } from './authLog.schema';

@Injectable()
export class AuthLogService {
  constructor(
    @InjectModel(AuthLog.name)
    private authLogModel: Model<AuthLogDocument>,
  ) {}

  async createLog(data: Partial<AuthLog>): Promise<AuthLog> {
    return this.authLogModel.create(data);
  }

  async findAll(): Promise<AuthLogDocument[]> {
    return this.authLogModel.find().sort({ loginTime: -1 }).exec();
  }
}
