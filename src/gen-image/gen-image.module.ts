import {Global, Module} from "@nestjs/common";
import {GenImageController} from "./gen-image.controller";
import {GenImageService} from "./gen-image.service";
import {EventEmitterModule} from "@nestjs/event-emitter";


@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [GenImageController],
  providers: [GenImageService]
})
export class GenImageModule {}
