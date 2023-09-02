import {HttpException, HttpStatus, Injectable, Logger} from "@nestjs/common";
import {KonvaGen} from "./konva-gen";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {writeFile} from "node:fs";
import {GenQuality} from "@gen-image/utils/constant";

const path = require('node:path')

@Injectable()
export class GenImageService {

    async genImage(
        template: string | object,
        imageId: string[],
        options: GenImageReplaceObject[]
    ) {
        const konvaGen = await this.initTemplate(imageId, template)
        try {
            return Promise.all(options.map(option => this.genOneOptions(option, konvaGen)))
        }catch (e) {
            Logger.error(e)
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR)
        }



    }

    async initTemplate(imageId: string[], template: string | object) {
        const konvaGen = new KonvaGen(template)

        if (imageId) {
            await konvaGen.reFormImages(Array.from(new Set(imageId).values()))
        }

        return konvaGen
    }

    writeFile(path: string, dataUrl: Buffer){
        return new Promise((resolve, reject) => {
            writeFile(path, dataUrl, (error) => {
                if(error) {
                    reject(error)
                }
                resolve(path)
            })
        })
    }

    async genOneOptions(option: GenImageReplaceObject, konvaGen: KonvaGen) {
        return new Promise(async (resolve, reject) => {
            await konvaGen.replaceObject(option)
            konvaGen.draw()
            const dataUrl = konvaGen.toDataUrl(GenQuality.Good)
            try {
                const response = <{ type: string, data: Buffer }>this.decodeBase64Image(dataUrl)

                const filePath = path.join(__dirname, '..', 'assets', 'images_gen', `data${Date.now()}.${response.type.split('/')[1]}`)

                await this.writeFile(filePath, response.data).then(
                    () => {resolve(filePath)},
                )
            } catch (e) {
               reject(e)
            }
        })

    }

    decodeBase64Image(dataString: string) {
        const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)!;
        const response: Partial<{ type: string, data: Buffer }> = {}

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = Buffer.from(matches[2], 'base64')

        return <{ type: string, data: Buffer }>response;
    }

}
