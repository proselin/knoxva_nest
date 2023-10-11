import {Module} from '@nestjs/common';
import {getEnvOrThrow} from '@shared/utils/functions';
import {CONFIG_NAME} from '@shared/utils/enums';
import {NestMinioModule} from 'nestjs-minio';

@Module({
    controllers: [],
    imports: [
        NestMinioModule.register(
            {
                isGlobal: true,
                endPoint: getEnvOrThrow(CONFIG_NAME.MINIO_ENDPOINT),
                port: +getEnvOrThrow(CONFIG_NAME.MINIO_PORT),
                useSSL: getEnvOrThrow(CONFIG_NAME.MINIO_USESSL) === 'true',
                accessKey: getEnvOrThrow(CONFIG_NAME.MINIO_ACCESS_KEY),
                secretKey: getEnvOrThrow(CONFIG_NAME.MINIO_SECRET_KEY),
            }),
    ],
})
export class MinIOModule {
}