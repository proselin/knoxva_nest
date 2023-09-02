import {Module} from "@nestjs/common";
import {GenImageController} from "./gen-image.controller";
import {GenImageService} from "./gen-image.service";

@Module({
  imports: [],
  controllers: [GenImageController],
  providers: [GenImageService]
})
export class GenImageModule {}
