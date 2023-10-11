import {Module} from "@nestjs/common";
import {BullModule} from "@nestjs/bull";
import {getEnvOrThrow} from "@shared/utils/functions";
import {CONFIG_NAME} from "@shared/utils/enums";
import { MinIOModule } from "@minio/minio.module";
import {GenerateImageModule} from "@generate-image/generate-image.module";

@Module(
    {
        imports: [
            BullModule.forRoot({
                redis: {
                    host: getEnvOrThrow(CONFIG_NAME.REDIS_HOST),
                    port: +getEnvOrThrow(CONFIG_NAME.REDIS_PORT),
                },
            }),
            GenerateImageModule,
            MinIOModule,
        ]
    }
)
export class AppModule {}