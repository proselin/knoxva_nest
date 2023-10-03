import {GenImageRepository} from "@gen-image/gen-image.repository";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenQuality} from "@gen-image/utils/constant";
import {Inject, Injectable, Logger} from "@nestjs/common";
import {KonvaGen} from "./konva-gen";
import {MINIO_CONNECTION} from "nestjs-minio";
import {Client} from 'minio';
import {randomUUID} from "crypto";
import {Image} from "konva/lib/shapes/Image";
import * as console from "console";
import Konva from "konva";


@Injectable()
export class GenImageService {
    private readonly logger = new Logger(GenImageService.name)

    constructor(
        private repository: GenImageRepository,
        @Inject(MINIO_CONNECTION) private readonly minioClient: Client
    ) {
    }

    async genImage(
        template: string,
        options: GenImageReplaceObject[],
        genQuality: GenQuality = GenQuality.Normal
    ) {
        return this.handleEvent({template, options, genQuality})
    }

    async handleEvent({template, options, genQuality}: any) {
        this.logger.log(":: Enter genImage function ")
        const uidMain = randomUUID()
        console.time(uidMain)
        let konvaGen = await this.repository.initTemplate(template, options);
        try {

            options.map(async (option) => {
                const uid = randomUUID()
                console.time(uid)
                let result = await this.repository.genOneOptions(option, konvaGen, genQuality);
                return this.saveTicket({konvaGen: result, genQuality, uid}).then(() => {
                    result.clean()
                })
            });

        } catch (e) {
            this.logger.error(":: Error genImage function ")
            this.logger.error(e)
        }
        konvaGen.clean()
        console.timeEnd(uidMain)
    }


    // @OnEvent('order.saveticket')
    pushQueue(input: { konvaGen: KonvaGen, genQuality: GenQuality, uid: string }) {
        this.saveTicket(input)
    }

    saveTicket({konvaGen, genQuality, uid}: {
        konvaGen: KonvaGen,
        genQuality: GenQuality,
        uid: string
    }, callBack?: Function) {

        return konvaGen.toImage(genQuality).then(
            (response: Image) => {
                const result = <{ type: string, data: Buffer }>this.repository.decodeBase64Image(response['src'])

                const metaData: Parameters<typeof this.minioClient.putObject>[3] = {
                    "Content-Encoding": 'base64',
                    "Content-Type": result?.type
                }
                return new Promise((resolve, reject) => {
                    this.minioClient.putObject(
                        'tdh.genarate-ticket',
                        `TDH-${uid}.png`,
                        result?.data!,
                        metaData,
                    ).then(
                        (res) => {
                            this.logger.log(res)
                            console.timeEnd(uid)
                            resolve(`TDH-${uid}.png`)
                        })
                })
            }
        )
    }
}
