import {NestFactory} from "@nestjs/core";
import {ChildProcessModule} from "./child-process.module";
import {GenerateImageService} from "@generate-image/generate-image.service";
import {PassDataChild} from "@shared/types/child.type";
import {Logger} from "@nestjs/common";
import * as process from "process";
import {getEnvOrThrow} from "@shared/utils/functions";
import {CONFIG_NAME} from "@shared/utils/enums";

const MAX_MEMORY_RESTART = +getEnvOrThrow(CONFIG_NAME.CHILD_MAX_RESTART_RAM)

async function bootstrap() {
    const app = await NestFactory.createMicroservice(ChildProcessModule);
    const service = app.select(ChildProcessModule).get(GenerateImageService)

    process.on('message', async (data: PassDataChild) => {

        if (data.command == "generateImage") {

            const result = await service?.genImage(
                data.template,
                data.replaceObj,
                data.quality
            )

            process?.send && process.send(result)

            const memoryInMB = process?.memoryUsage?.rss()! / 1e+6
            Logger.log("Current childProcess MB " + memoryInMB + "MB" ,"ChildProcess")

            if(memoryInMB >= MAX_MEMORY_RESTART){
                Logger.warn("Memory in limit " + memoryInMB + "MB","ChildProcess" )
                Logger.warn("Kill Child Process Id: " + process.pid, "ChildProcess")
                process.kill(process.pid)
            }

        }
    });
}

bootstrap();