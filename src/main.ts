import { NestFactory } from '@nestjs/core';
import { GenImageModule } from './gen-image/gen-image.module';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(GenImageModule)
  app.useGlobalPipes(
      new ValidationPipe()
  )
  await app.listen(4000);
}
bootstrap();
