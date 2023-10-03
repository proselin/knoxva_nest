import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from "@nestjs/common";
import {join} from 'path';
import {AppModule} from './app.module';
const express = require('express')
import { setFlagsFromString } from 'v8';
import { runInNewContext } from 'vm';



async function bootstrap() {
    setFlagsFromString('--expose_gc');
    const gc = runInNewContext('gc'); // nocommit
    if(!global.gc) {
        global.gc = gc
    }
    const app = await NestFactory.create(AppModule)
    app.useGlobalPipes(
        new ValidationPipe()
    )
    app.use(express.static(join(__dirname, 'assets')));
    await app.listen(3000);
}

bootstrap()