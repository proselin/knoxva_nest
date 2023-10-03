import {KonvaGen} from "@gen-image/konva-gen";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenQuality} from "@gen-image/utils/constant";
import {Injectable, Logger} from "@nestjs/common";
import * as console from "console";
import {randomUUID} from "crypto";
import {join} from "node:path";


@Injectable()
export class GenImageRepository {


    private _logger = new Logger(GenImageRepository.name)
    logger = {
        log: (...arg: any[]) => {},
        warn: (...arg: any[]) => {},
        error: (...arg: any[]) => this._logger.error(arg),

    }

    decodeBase64Image(dataString: string): Error | { type: string; data: Buffer } {
        const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)!;
        const response: Partial<{ type: string, data: Buffer }> = {}

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = Buffer.from(matches[2], 'base64')

        return <{ type: string, data: Buffer }>response;
    }


    genNewImagePath(type: string): string {
        return join(
            __dirname,
            '..',
            'assets',
            'images_gen',
            `data${Date.now()}.${type.split('/')[1]}`
        )
    }

     genOneOptions(option: GenImageReplaceObject, konvaGen: KonvaGen, genQuality: GenQuality): Promise<KonvaGen> {
        this.logger.log(":: Enter genOneOptions function ")
        this.logger.log(":: GenQuality " + genQuality)
        this.logger.log(":: options " + JSON.stringify(option))
        const key = randomUUID()
        console.time(key)

         return konvaGen.replaceObject(option).then(() => {
             konvaGen.draw()
             return konvaGen
         })
     }

    async initTemplate(template: string | object, replaceOb: GenImageReplaceObject[]): Promise<KonvaGen> {
        this.logger.log(":: Enter function initTemplate")
        this.logger.log(":: Template: " + typeof template == "string" ? template : JSON.stringify(template))
        const konvaGen = new KonvaGen(template)
        await konvaGen.reFormImages(replaceOb)
        this.logger.log(":: Complete function initTemplate")
        return konvaGen
    }


}