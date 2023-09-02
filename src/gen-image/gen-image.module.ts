import { Module } from "@nestjs/common";
import { GenImageController } from "./gen-image.controller";
import { GenImageService } from "./gen-image.service";
import {ServeStaticModule} from "@nestjs/serve-static";
import { join } from "path";

@Module({
  imports: [
      ServeStaticModule.forRoot(
          {
            rootPath: join(__dirname, '..', 'assets'),
          }
      )
  ],
  controllers: [GenImageController],
  providers: [GenImageService]
})
export class GenImageModule {}
