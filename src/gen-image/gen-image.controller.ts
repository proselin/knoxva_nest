import {Body, Controller, Get, Logger, Res} from "@nestjs/common";
import { GenImageService } from "./gen-image.service";
import testJson from "@assets/json/test-json";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import { GenImageDTO } from "./dtos/genImage.dto";

@Controller('/gen')
export class GenImageController {

    constructor(private genImageService: GenImageService) {
        
    }


    @Get()
    genImage(@Body() genImageBody: GenImageDTO) {
            Logger.log('Have In')
            const template = genImageBody.template
            const obReplace: GenImageReplaceObject[] = genImageBody.options
            const genQuality = genImageBody.genQuality
            return this.genImageService.genImage(template, obReplace, genQuality)
    }
}