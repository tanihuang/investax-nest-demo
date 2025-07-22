import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user_logs', timestamps: true })
export class UserLog extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true, enum: ['login', 'logout'] })
  action: 'login' | 'logout';

  @Prop()
  loginTime: Date;

  @Prop()
  logoutTime?: Date;

  @Prop()
  ipAddress: string;

  @Prop()
  tokenName: string;
}

export const UserLogSchema = SchemaFactory.createForClass(UserLog);
