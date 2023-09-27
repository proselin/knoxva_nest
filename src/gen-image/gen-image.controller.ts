import {Body, Controller, Get, Logger, Query} from "@nestjs/common";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenImageDTO} from "./dtos/genImage.dto";
import * as console from "console";
import {GenImageConsumer} from "@gen-image/gen-image.consumer";
import {GenImageProducer} from "@gen-image/gen-image.producer";

const fetch = require("node-fetch")
const fs = require("fs");


@Controller('/gen')
export class GenImageController {

    logger = new Logger(GenImageController.name)

    constructor(private genImageProducer: GenImageProducer) {

    }


    @Get()
    async genImage(@Body() genImageBody: GenImageDTO) {
        const template = genImageBody.template
        const obReplace: GenImageReplaceObject[] = genImageBody.options
        const genQuality = genImageBody.genQuality
        await this.genImageProducer.addJob(template, obReplace, genQuality)
    }

    @Get('/download')
    async download(@Query('url') url: string) {
        const response = await fetch(url)

        const buffer = Buffer.from(await response.arrayBuffer())
        console.log("OKE")
    }
}