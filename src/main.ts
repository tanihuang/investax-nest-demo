import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { TransformInterceptor } from './transform.interceptor';
import { AuthModule } from './common/auth/auth.module';

async function bootstrap() {
  const moduleObj = {
    app: AppModule,
    auth: AuthModule,
  };
  const Module = moduleObj[process.env.NODE_MODULE] || AppModule;
  const logger = new Logger();
  const app = await NestFactory.create(Module, { cors: true });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  const port = 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
  logger.log(`🚀 Loaded module: ${Module}`);
}
bootstrap();
