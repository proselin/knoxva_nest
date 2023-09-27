import {GenImageModule} from "@gen-image/gen-image.module";
import {Module} from "@nestjs/common";
import {MinIOModule} from "./minio/minio.module";
import {BullModule} from "@nestjs/bull";


@Module(
    {
        imports: [
            GenImageModule,
            MinIOModule,
            BullModule.forRoot({
                redis: {
                    host: 'localhost',
                    port: 6379,
                },
            }),
        ]
    }
)
export class AppModule {
}