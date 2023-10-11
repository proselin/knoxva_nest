import {Module} from "@nestjs/common";
import {MinIOModule} from "@minio/minio.module";
import {GenerateImageService} from "@generate-image/generate-image.service";

@Module({
    imports: [MinIOModule],
    providers: [GenerateImageService]
})
export class ChildProcessModule {}