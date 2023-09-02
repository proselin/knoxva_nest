import {Controller, Get, Logger, Res} from "@nestjs/common";
import { GenImageService } from "./gen-image.service";
import testJson from "@assets/json/test-json";
import {GenImageReplaceObject} from "@gen-image/types/genImage";

@Controller('/gen')
export class GenImageController {

    constructor(private genImageService: GenImageService) {
        
    }


    @Get()
    genImage() {
            Logger.log('Have In')
            const template = testJson
            const imageId  = ['shit']
            const obReplace: GenImageReplaceObject[] = [{
                qr: "",
                name: "Không ổn rồi",
            }]
            return this.genImageService.genImage(template, imageId, obReplace)

    }
}