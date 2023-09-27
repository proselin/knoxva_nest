import {Module} from "@nestjs/common";
import {GenImageController} from "./gen-image.controller";
import {GenImageService} from "./gen-image.service";
import {BullModule} from "@nestjs/bull";
import {GenImageRepository} from "@gen-image/gen-image.repository";
import {GenImageConsumer} from "@gen-image/gen-image.consumer";
import {GenImageProducer} from "./gen-image.producer";


@Module({
    imports: [
        BullModule.registerQueue({
            name: 'generate-ticket',
        })
    ],
    controllers: [GenImageController],
    providers: [
        GenImageService,
        GenImageRepository,
        GenImageProducer,
        GenImageConsumer
    ]
})
export class GenImageModule {
}
