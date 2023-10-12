import {Body, Controller, HttpCode, HttpStatus, Post, Scope, Version} from "@nestjs/common";
import {GenerateImageDTO} from "@shared/dtos/generateImageDTO";
import {GenerateImageProducer} from "@generate-image/generate-image.producer";
import {VERSIONS} from "@shared/utils/constant";
import {VERSION} from "@shared/utils/enums";
import {ResponseMessage} from "@shared/decorators/message-response.decorator";

@Controller({
    version: VERSIONS,
    path: '/generate',
    scope: Scope.REQUEST
})
export class GenerateImageController {
    constructor(private genImageProducer: GenerateImageProducer,) {}

    @Post()
    @ResponseMessage('Tạo Job thành công')
    @Version(VERSION.V1)
    @HttpCode(HttpStatus.CREATED)
    async genImage(@Body() generateImageDTO: GenerateImageDTO) {
        return this.genImageProducer.addJob(generateImageDTO)
    }
}