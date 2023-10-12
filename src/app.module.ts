import {Module} from "@nestjs/common";
import {BullModule} from "@nestjs/bull";
import {getEnvOrThrow} from "@shared/utils/functions";
import {CONFIG_NAME} from "@shared/utils/enums";
import {MinIOModule} from "@minio/minio.module";
import {GenerateImageModule} from "@generate-image/generate-image.module";
import { WinstonModule } from "nest-winston";


@Module(
    {
        imports: [
            BullModule.forRoot({
                defaultJobOptions: {
                    attempts: +getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_ATTEMPTS, 3),
                    delay: +getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_DELAY, 3000),
                    backoff: {
                        type: getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_BACKOFF_TYPE, 'exponential'),
                        delay: +getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_BACKOFF_DELAY, 1000),
                    }
                },
                limiter: {
                    max: +getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_LIMITER_MAX, 5),
                    duration: +getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_LIMITER_DURATION, 1000),
                },
                redis: {
                    host: getEnvOrThrow(CONFIG_NAME.REDIS_HOST),
                    port: +getEnvOrThrow(CONFIG_NAME.REDIS_PORT),
                },
            }),
            WinstonModule.forRoot({
            }),
            // options
            GenerateImageModule,
            MinIOModule,
        ]
    }
)
export class AppModule {}