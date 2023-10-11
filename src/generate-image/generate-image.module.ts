import {GenerateImageService} from "@generate-image/generate-image.service";
import {Logger, Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {BullModule} from "@nestjs/bull";
import {getEnvOrThrow} from "@shared/utils/functions";
import {CONFIG_NAME} from "@shared/utils/enums";
import {GenerateImageController} from "@generate-image/generate-image.controller";
import {ForkProcessService} from "@generate-child-process/fork-process.service";
import {GenerateImageProducer} from "@generate-image/generate-image.producer";
import {GenerateImageConsumer} from "@generate-image/generate-image.consumer";

@Module({
    imports: [
        BullModule.registerQueue({
            name: getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_QUEUE_NAME),
            limiter: {
                max: +getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_LIMITER_MAX, 5),
                duration: +getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_LIMITER_DURATION, 1000),
            }
        }),
    ],
    controllers: [GenerateImageController],
    providers: [
        GenerateImageService,
        ForkProcessService,
        GenerateImageProducer,
        GenerateImageConsumer
    ]
})
export class GenerateImageModule {
}
