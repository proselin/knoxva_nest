import {Module} from "@nestjs/common";
import {BullModule} from "@nestjs/bull";
import {MinIOModule} from "../minio/minio.module";
import {GenerateImageService} from "@gen-image/generate-image.service";

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'generate-ticket',
            limiter: {
                max: 2,
                duration: 1000
            }
        }),
        MinIOModule
    ],
    providers: [GenerateImageService]
})
export class ChildProcessModule {
}