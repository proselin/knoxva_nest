import {HttpException, HttpStatus, Injectable, Logger} from "@nestjs/common";
import {KonvaGen} from "./konva-gen";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {writeFile} from "node:fs";
import {GenQuality} from "@gen-image/utils/constant";
import {join} from "node:path"
import {AppClusterService} from "../task/app-cluster-service";
import process from "process";
import cluster from "node:cluster";
import {Image} from "konva/lib/shapes/Image";
import {validateEach} from "@nestjs/common/utils/validate-each.util";

@Injectable()
export class GenImageService {
    readonly logger = new Logger(GenImageService.name)

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
        this.logger.verbose(":: Enter genImage function ")
        const konvaGen = await this.initTemplate(template)
        const Images = konvaGen.getStage().find('Image')
        // Images.forEach(
        //     (value: Image) => {
        //         value.setAttr('raw', (value.toDataURL()))
        //         value.setAttr('source', null)
        //     }
        // )
        this.logger.log(konvaGen.getStage().toJSON())
        // if (cluster.isPrimary) {
        //     for (let i = 0; i < forks; i++) {
        //         cluster.fork()
        //     }
        // } else {
        //     this.logger.verbose(`::Start GenImage:: ProcessID: ${process.pid}`)
        //     await this.start(konvaGen, options, genQuality)
        // }

        // AppClusterService.clusterRise(
        //     async () => {
        //         this.logger.verbose(`::Start GenImage:: ProcessID: ${process.pid}`)
        //         await this.start(konvaGen, options, genQuality)
        //     }
        // )
    }


    async start(konvaGen: KonvaGen, options: GenImageReplaceObject[], genQuality: GenQuality) {
        try {
            // this.logger.log("ClusterFileLenght:: ", clusterFile.length)
            this.logger.log(":: Process ID :: ", cluster.worker!.id)

            // const clusterFile = options
            //     .filter((_, index) => index % forks == cluster.worker!.id - 1)
            //
            // await Promise.all(clusterFile.map(option => this.genOneOptions(option, konvaGen, genQuality)))
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
        this.logger.verbose(":: Enter genOneOptions function ")
        this.logger.verbose(":: GenQuality " + genQuality)
        this.logger.verbose(":: options " + JSON.stringify(option))
        return new Promise(async (resolve, reject) => {
            await konvaGen.replaceObject(option)
            konvaGen.draw()
            const dataUrl = konvaGen.toDataUrl(genQuality)
            try {
                this.logger.verbose(":: genOneOptions DataUrl success ")
                const response =
                    <{ type: string, data: Buffer }>
                        this.decodeBase64Image(dataUrl)
                const filePath = this.genNewImagePath(response.type)
                await this.writeFile(filePath, response.data).then(
                    () => {
                        this.logger.log(":: SaveFile result at : " + filePath),
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
        this.logger.verbose(":: Enter function initTemplate")
        this.logger.verbose(":: Template: " + typeof template == "string" ? template : JSON.stringify(template))
        const konvaGen = new KonvaGen(template)
        await konvaGen.reFormImages()
        this.logger.verbose(":: Complete function initTemplate")
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
