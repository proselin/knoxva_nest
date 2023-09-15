import {NestFactory} from '@nestjs/core';
import {GenImageModule} from '@gen-image/gen-image.module';
import {Logger, ValidationPipe} from "@nestjs/common";
import {join} from 'path';
import {AppClusterService} from "./task/app-cluster-service";

const express = require('express')

async function bootstrap() {
  const app = await NestFactory.create(GenImageModule,{logger:  ['log']})
  app.useGlobalPipes(
      new ValidationPipe()
  )
  app.use(express.static(join(__dirname, 'assets')));

  app.listen(3000).then(
      () => Logger.log(`App start at port {3000} | http://localhost:3000`, 'bootstrap')
  );
}
bootstrap()
// AppClusterService.clusterRise(bootstrap)
