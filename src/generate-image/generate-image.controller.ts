import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Scope, Version } from "@nestjs/common";
import { GenerateImageDTO } from "@shared/dtos/generateImageDTO";
import { GenerateImageProducer } from "@generate-image/generate-image.producer";
import { VERSIONS } from "@shared/utils/constant";
import { VERSION } from "@shared/utils/enums";

@Controller({
    version: VERSIONS,
    path: '/generate',
    scope: Scope.REQUEST
})
export class GenerateImageController {
    constructor(private genImageProducer: GenerateImageProducer,) {}

    @Post()
    @Version(VERSION.V1)
    @HttpCode(HttpStatus.CREATED)
    async genImage(@Body() generateImageDTO: GenerateImageDTO) {
       try {
           await this.genImageProducer.addJob(generateImageDTO)
       }catch ( e ){
           Logger.error(e)
           throw new Error(e)
       }
    }
}