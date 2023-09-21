import {Body, Controller, Get, Logger, Query} from "@nestjs/common";
import {GenImageService} from "./gen-image.service";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenImageDTO} from "./dtos/genImage.dto";
import * as console from "console";

const fetch = require("node-fetch")
const fs = require("fs");


@Controller('/gen')
export class GenImageController {

    logger = new Logger(GenImageController.name)

    constructor(private genImageService: GenImageService) {

    }


    @Get()
    genImage(@Body() genImageBody: GenImageDTO) {
        const template = genImageBody.template
        const obReplace: GenImageReplaceObject[] = genImageBody.options
        const genQuality = genImageBody.genQuality
        this.logger.log("Đang gen ", obReplace.length)
        return this.genImageService.genImage(template, obReplace, genQuality)
    }

    @Get('/download')
    async download(@Query('url') url: string) {
        const response = await fetch(url)

        const buffer = Buffer.from(  await response.arrayBuffer())
        console.log("OKE")
    }
}