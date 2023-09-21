import { Global, Module } from '@nestjs/common';
import { NestMinioModule } from 'nestjs-minio';

@Global()
@Module({
    controllers: [],
    imports: [
        NestMinioModule.register(
            {
                isGlobal: true,
                endPoint: '172.25.88.20',
                port: 9000,
                useSSL: false,
                accessKey: 'meow',
                secretKey: 'tdh-20092023@makeColor',
            }),
    ],
})
export class MinIOModule { }