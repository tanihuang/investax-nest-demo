import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthLog, AuthLogDocument } from './authLog.schema';
import { AuthLogDto } from './dto/authLog.dto';

@Injectable()
export class AuthLogService {
  constructor(
    @InjectModel(AuthLog.name)
    private authLogModel: Model<AuthLogDocument>,
  ) {}

  async createLog(data: Partial<AuthLog>): Promise<AuthLog> {
    return this.authLogModel.create(data);
  }

  async findAll(): Promise<AuthLogDto[]> {
    const logs = await this.authLogModel.find().sort({ loginTime: -1 }).lean().exec();

    return logs.map((log: any) => ({
      id:
        typeof log._id === 'object' && log._id.toString ? log._id.toString() : String(log._id),
      userId: log.userId,
      username: log.username,
      role: log.role,
      action: log.action,
      loginTime: log.loginTime,
      logoutTime: log.logoutTime,
      ipAddress: log.ipAddress,
      tokenName: log.tokenName,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    }));
  }

  async deleteLogById(id: string): Promise<{ deleted: boolean }> {
    const result = await this.authLogModel.deleteOne({ _id: id }).exec();
    return { deleted: result.deletedCount === 1 };
  }
}
