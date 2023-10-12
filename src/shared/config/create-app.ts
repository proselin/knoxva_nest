import {setFlagsFromString} from "v8";
import {runInNewContext} from "vm";
import {NestFactory, Reflector} from "@nestjs/core";
import {AppModule} from "../../app.module";
import {ValidationPipe, VersioningType} from "@nestjs/common";
import {VERSION} from "@shared/utils/enums";
import * as express from "express";
import {join} from "path";
import {FastifyAdapter, NestFastifyApplication} from "@nestjs/platform-fastify";
import {LoggingInterceptor} from "@shared/interceptor/logging.interceptor";
import {TransformInterceptor} from "@shared/interceptor/transform-response.interceptor";
import {TimeoutInterceptor} from "@shared/interceptor/timeout.interceptor";

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

    app.useGlobalInterceptors(
        new LoggingInterceptor()
    )

    app.useGlobalInterceptors(
        new TransformInterceptor<any>(new Reflector())
    )

    app.useGlobalInterceptors(
        new TimeoutInterceptor()
    )

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: VERSION.V1
    });

    app.setGlobalPrefix('api')

    app.use(express.static(join(__dirname, 'assets')));

    return app
}