import {GenImageRepository} from "@gen-image/gen-image.repository";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenQuality} from "@gen-image/utils/constant";
import {Global, Inject, Injectable, Logger} from "@nestjs/common";
import {KonvaGen} from "./konva-gen";
import {MINIO_CONNECTION} from "nestjs-minio";
import {Client} from 'minio';
import {randomUUID} from "crypto";
import {Image} from "konva/lib/shapes/Image";
import * as console from "console";


@Global()
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

    handleEvent({template, options, genQuality}: any) {
        this.logger.log(":: Enter genImage function ")
        const uidMain = randomUUID()
        return this.repository.initTemplate(template, options).then(
            (konvaGen) => {
                try {
                    return Promise.all(options.map((option) => {
                        const uid = randomUUID()
                        console.time(uid)
                        let localKonva = new KonvaGen(konvaGen.getStage())
                        return this.repository.genOneOptions(option, localKonva, genQuality)
                            .then((result) => {
                                return this.saveTicket({konvaGen: result, genQuality, uid})
                            });
                    })).then(
                        (res) => {
                            konvaGen.clean()
                            return res
                        }
                    )

                } catch (e) {
                    this.logger.error(":: Error genImage function ")
                    this.logger.error(e)
                }
            })
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
                            konvaGen.clean()
                            console.timeEnd(uid)
                            resolve(`TDH-${uid}.png`)
                        })
                })
            }
        )
    }
}
