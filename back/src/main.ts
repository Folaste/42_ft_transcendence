import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cors = require('cors');

  app.use(cors());
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true, 
    forbidNonWhitelisted:true
  }));
  process.env.TZ = 'UTC+2';
  await app.listen(3001);
}
bootstrap();
