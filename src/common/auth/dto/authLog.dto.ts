export class AuthLogDto {
  id: string;
  userId: string;
  username: string;
  role: string;
  action: 'login' | 'logout';
  loginTime: Date;
  logoutTime?: Date;
  ipAddress: string;
  tokenName: string;
  createdAt: Date;
  updatedAt: Date;
}
