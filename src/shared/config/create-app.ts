import {setFlagsFromString} from "v8";
import {runInNewContext} from "vm";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "../../app.module";
import {ValidationPipe, VersioningType} from "@nestjs/common";
import {VERSION} from "@shared/utils/enums";
import * as express from "express";
import {join} from "path";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";

export async function createApp() {
    setFlagsFromString('--expose_gc');
    const gc = runInNewContext('gc'); // nocommit
    if (!global.gc) {
        global.gc = gc
    }
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter()
    )

    app.useGlobalPipes(
        new ValidationPipe()
    )
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: VERSION.V1
    });

    app.setGlobalPrefix('api')

    app.use(express.static(join(__dirname, 'assets')));

    return app
}