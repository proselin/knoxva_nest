import {Module} from "@nestjs/common";
import {GenImageModule} from "@gen-image/gen-image.module";

@Module({
    imports: [GenImageModule]
})
export class AppModule {}