import {GenImageModule} from "@gen-image/gen-image.module";
import {Logger, Module} from "@nestjs/common";
import {MinIOModule} from "./minio/minio.module";


@Module(
    {
        imports: [
            GenImageModule, 
            MinIOModule
        ]
    }
)
export class AppModule {}