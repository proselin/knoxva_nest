import {Body, Controller, Get, HttpCode, HttpStatus, Logger, Res} from "@nestjs/common";
import {GenImageService} from "./gen-image.service";
import testJson from "@assets/json/test-json";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenImageDTO} from "./dtos/genImage.dto";
import {Response} from "express";

@Controller('/gen')
export class GenImageController {

    constructor(private genImageService: GenImageService) {
    }


    @Get()
    @HttpCode(HttpStatus.CREATED)
    genImage(@Body() genImageBody: GenImageDTO) {
        Logger.log(':: Call GenImage API')
        const template = genImageBody.template
        const imageId = ['shit']
        const obReplace: GenImageReplaceObject[] = genImageBody.options
        const genQuality = genImageBody.genQuality

        this.genImageService.genImage(template, imageId, obReplace, genQuality)
        return {message : "OKE"}
    }
}