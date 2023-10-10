import {Body, Controller, Get, Logger, Post, Query, Scope} from "@nestjs/common";
import {IReplaceObject} from "../shared/types/genImage";
import {GenImageDTO} from "../shared/dtos/genImage.dto";
import * as console from "console";
import {GenImageProducer} from "@gen-image/gen-image.producer";
import {ChildProcessModule} from "../generate-image-child-process/child-process.module";
import {ForkProcessService} from "../generate-image-child-process/fork-process.service";
import * as child from "child_process"
const fetch = require("node-fetch")
const fs = require("fs");


@Controller({
    path: '/generate',
    scope: Scope.REQUEST
})
export class GenImageController {

    logger = new Logger(GenImageController.name)

    constructor(
        private genImageProducer: GenImageProducer,
        private genImageProcess: ForkProcessService
    ) {

    }


    @Post()
    async genImage(@Body() genImageBody: GenImageDTO) {

        const template = genImageBody.template
        const obReplace: IReplaceObject[] = genImageBody.options
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