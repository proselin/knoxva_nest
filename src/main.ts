import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from "@nestjs/common";
import {join} from 'path';
import { AppModule } from './app.module';

const express = require('express')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
      new ValidationPipe()
  )
  app.use(express.static(join(__dirname, 'assets')));
  await app.listen(3000);
}
bootstrap();
