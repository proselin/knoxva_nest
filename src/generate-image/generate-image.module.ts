import {GenerateImageService} from "@generate-image/generate-image.service";
import {Module} from "@nestjs/common";
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
            name: getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_QUEUE_NAME)
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
