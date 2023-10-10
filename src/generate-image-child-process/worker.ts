import {NestFactory} from "@nestjs/core";
import {ChildProcessModule} from "./child-process.module";
import {GenerateImageService} from "@gen-image/generate-image.service";
import {PassDataChild} from "./child.type";
import * as process from "process";
import {Logger} from "@nestjs/common";

let service: GenerateImageService | null = null

async function bootstrap() {
    const app = await NestFactory.create(ChildProcessModule);
    service = app.select(ChildProcessModule).get(GenerateImageService)
    process.on('message', async (data: PassDataChild) => {
        if (data.command == "generateImage") {
            const rs = await service?.genImage(
                data.template,
                data.replaceObj,
                data.quality
            )
            process?.send && process.send(rs)
            process.kill(process.pid)
            Logger.log(process.memoryUsage.rss())
        }
    });
}

bootstrap();