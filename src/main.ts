import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MongooseExceptionFilter } from './exception/mongoose-exception.filter';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); 

  app.useGlobalPipes(new ValidationPipe());
  
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new MongooseExceptionFilter()
  );

  await app.listen(3000);
}
bootstrap();