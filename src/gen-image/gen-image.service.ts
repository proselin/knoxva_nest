import {HttpException, HttpStatus, Injectable, Logger} from "@nestjs/common";
import {KonvaGen} from "./konva-gen";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {writeFile} from "node:fs";
import {GenQuality} from "@gen-image/utils/constant";
import {join} from "node:path"
import * as path from "path";

@Injectable()
export class GenImageService {
    private readonly logger = new Logger(GenImageService.name)

    async genImage(
        template: string | object,
        imageId: string[],
        options: GenImageReplaceObject[],
        genQuality: GenQuality = GenQuality.Normal
    ) {
        this.logger.log(":: Enter genImage function ")
        const konvaGen = await this.initTemplate(imageId, template)
        try {
            return Promise.all(options.map(option => this.genOneOptions(option, konvaGen, genQuality)))
        } catch (e) {
            this.logger.error(":: Error genImage function ")
            this.logger.error(e)
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR)
        }


    }

    async initTemplate(imageId: string[], template: string | object) {
        this.logger.log(":: Enter function initTemplate")
        this.logger.log(":: Template: " + typeof template == "string" ? template : JSON.stringify(template)  )
        const konvaGen = new KonvaGen(template)

        if (imageId) {
            await konvaGen.reFormImages(Array.from(new Set(imageId).values()))
        }
        this.logger.log(":: Complete function initTemplate")
        return konvaGen
    }

    writeFile(path: string, dataUrl: Buffer) {
        return new Promise((resolve, reject) => {
            writeFile(path, dataUrl, (error) => {
                if (error) {
                    reject(error)
                }
                resolve(path)
            })
        })
    }

    async genOneOptions(option: GenImageReplaceObject, konvaGen: KonvaGen, genQuality: GenQuality = GenQuality.Normal) {
        this.logger.log(":: Enter genOneOptions function ")
        this.logger.log(":: GenQuality " + genQuality)
        this.logger.log(":: options " + JSON.stringify(option))
        return new Promise(async (resolve, reject) => {
            await konvaGen.replaceObject(option)
            konvaGen.draw()
            const dataUrl = konvaGen.toDataUrl(genQuality)
            try {
                this.logger.log(":: genOneOptions DataUrl success ")
                const response =
                    <{ type: string, data: Buffer }>
                        this.decodeBase64Image(dataUrl)
                const filePath = this.genNewImagePath(response.type)
                    await this.writeFile(filePath, response.data).then(
                        () => {
                            this.logger.log(":: genOneOptions result at: ", filePath)
                            resolve(filePath)
                        },
                    )
            } catch (e) {
                this.logger.error(":: genOneOptions Error")
                reject(e)
            }
        })

    }

    genNewImagePath(type: string) {
        return join(
            __dirname,
            '..',
            'assets',
            'images_gen',
            `data${Date.now()}.${type.split('/')[1]}`
        )
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
