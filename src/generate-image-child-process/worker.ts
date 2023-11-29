import {NestFactory} from "@nestjs/core";
import {ChildProcessModule} from "./child-process.module";
import {GenerateImageService} from "@generate-image/generate-image.service";
import {PassDataChild} from "@shared/types/child.type";
import {Logger} from "@nestjs/common";
import {getEnvOrThrow} from "@shared/utils/functions";
import {CONFIG_NAME} from "@shared/utils/enums";

const MAX_MEMORY_RESTART = +getEnvOrThrow(CONFIG_NAME.CHILD_MAX_RESTART_RAM)
const logger = new Logger(ChildProcessModule.name)

async function bootstrap() {

    const app = await NestFactory.create(ChildProcessModule);
    const service = app.select(ChildProcessModule).get(GenerateImageService)

    process.on('message', async (data: PassDataChild) => {

        if (data.command == "generateImage") {
            try{
                const result = await service?.genImage(
                    data.template,
                    data.replaceObj,
                    data.quality
                )
                process?.send && process.send({
                    isError: false,
                    data: result
                })

            const memoryInMB = process?.memoryUsage?.rss()! / 1e+6

            logger.log("Current child process memory:  " + memoryInMB + "MB" )

            if(memoryInMB >= MAX_MEMORY_RESTART){
                logger.warn("Memory in limit " + memoryInMB + "MB")
                logger.warn("Kill Child Process Id: " + process.pid)
                process.exit(0)   
            }

            }catch(e) {
                process?.send && process.send({
                    isError: true,
                    data: e
                })
            }
        }
    });
}

bootstrap();