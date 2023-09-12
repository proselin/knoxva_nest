import {NestFactory} from '@nestjs/core';
import {GenImageModule} from '@gen-image/gen-image.module';
import {ValidationPipe} from "@nestjs/common";
import {join} from 'path';
import {AppClusterService} from "./task/app-cluster-service";

const express = require('express')

async function bootstrap() {
  const app = await NestFactory.create(GenImageModule,{logger:  ['log']})
  app.useGlobalPipes(
      new ValidationPipe()
  )
  app.use(express.static(join(__dirname, 'assets')));
  await app.listen(3000);
}
AppClusterService.clusterRise(bootstrap)
