import {GenImageRepositoryInterface} from "@gen-image/types/genImageRepositoryInterface";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenQuality} from "@gen-image/utils/constant";
import {KonvaGen} from "@gen-image/konva-gen";
import {HttpException, HttpStatus, Logger} from "@nestjs/common";
import {writeFile} from "fs";
import {join} from "node:path";

export class GenImageRepository implements GenImageRepositoryInterface {
    readonly logger = new Logger(GenImageRepository.name)

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

    async genImage(template: string | object, options: GenImageReplaceObject[], genQuality: GenQuality): Promise<any> {
        this.logger.log(":: Enter genImage function ")
        const konvaGen = await this.initTemplate(template)
        try {
            return Promise.all(options.map(option => this.genOneOptions(option, konvaGen, genQuality)))
        } catch (e) {
            this.logger.error(":: Error genImage function ")
            this.logger.error(e)
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR)
        }
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

    genOneOptions(option: GenImageReplaceObject, konvaGen: KonvaGen, genQuality: GenQuality): Promise<any> {
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

    async initTemplate(template: string | object): Promise<KonvaGen> {
        this.logger.log(":: Enter function initTemplate")
        this.logger.log(":: Template: " + typeof template == "string" ? template : JSON.stringify(template))
        const konvaGen = new KonvaGen(template)

        // if (imageId) {
        //     await konvaGen.reFormImages(Array.from(new Set(imageId).values()))
        // }
        await konvaGen.reFormImages()
        this.logger.log(":: Complete function initTemplate")
        return konvaGen
    }

    writeFile(path: string, dataUrl: Buffer): Promise<any> {
        return new Promise((resolve, reject) => {
            writeFile(path, dataUrl, (error) => {
                if (error) {
                    reject(error)
                }
                resolve(path)
            })
        })
    }

}