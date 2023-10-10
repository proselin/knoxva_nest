import {Module} from "@nestjs/common";
import {GenImageController} from "./gen-image.controller";
import {BullModule} from "@nestjs/bull";
import {GenImageConsumer} from "@gen-image/gen-image.consumer";
import {GenImageProducer} from "./gen-image.producer";
import {ForkProcessService} from "../generate-image-child-process/fork-process.service";
import {GenerateImageService} from "@gen-image/generate-image.service";


@Module({
    imports: [
        BullModule.registerQueue({
            name: 'generate-ticket',
            limiter: {
                max: 5,
                duration: 1000
            }
        })
    ],
    controllers: [GenImageController],
    providers: [
        GenerateImageService,
        ForkProcessService,
        GenImageProducer,
        GenImageConsumer
    ]
})
export class GenImageModule {
}
