import {Body, Controller, Get, HttpCode, HttpStatus, Logger} from "@nestjs/common";
import {GenImageService} from "./gen-image.service";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenImageDTO} from "./dtos/genImage.dto";

import * as os from "os";
import * as console from "console";
import {WorkerPool} from "../task/worker-pool";
@Controller('/gen')
export class GenImageController {

    pool = new WorkerPool(os.cpus().length, `${__dirname}/../task/worker.js`);
    constructor(private genImageService: GenImageService) {
    }


    @Get()
    @HttpCode(HttpStatus.CREATED)
    genImage(@Body() genImageBody: GenImageDTO) {
        Logger.log("::In Coming request:: {/gen}")
        const template = genImageBody.template
        const obReplace: GenImageReplaceObject[] = genImageBody.options
        const genQuality = genImageBody.genQuality;

        (obReplace ?? [] as GenImageReplaceObject[]).forEach(
            (option) => {
                this.pool.runTask({template, option, genQuality}, () => {
                    console.log("oke")
                })
            }
        )

        return "Created"
    }
}