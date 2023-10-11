import {Body, Controller, HttpCode, HttpStatus, Logger, Post, Scope, Version} from "@nestjs/common";
import {GenerateImageDTO} from "@shared/dtos/generateImageDTO";
import {GenerateImageProducer} from "@generate-image/generate-image.producer";
import {VERSIONS} from "@shared/utils/constant";
import {VERSION} from "@shared/utils/enums";

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
        await this.genImageProducer.addJob(generateImageDTO)
    }

    @Post()
    @Version(VERSION.V2)
    @HttpCode(HttpStatus.CREATED)
    async genImageV2() {
        Logger.log('Vào Cái 2 rồi nè')
    }
}