import {GenImageRepository} from "@gen-image/gen-image.repository";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenQuality} from "@gen-image/utils/constant";
import {Inject, Injectable, Logger} from "@nestjs/common";
import {KonvaGen} from "./konva-gen";
import {MINIO_CONNECTION} from "nestjs-minio";
import {Client} from 'minio';
import {randomUUID} from "crypto";


@Injectable()
export class GenImageService {
    private readonly logger = new Logger(GenImageService.name)
    repository = new GenImageRepository()


    constructor(
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
        this.repository.initTemplate(template, options).then((konvaGen) => {
                try {
                    // return Promise.all(
                    options.forEach((option) => {
                        const uid = randomUUID()
                        console.time(uid)
                        return this.repository.genOneOptions(option, new KonvaGen(konvaGen.getStage()), genQuality)
                            .then((result) => {

                                const metaData: Parameters<typeof this.minioClient.putObject>[3] = {
                                    "Content-Encoding": 'base64',
                                    "Content-Type": result?.type
                                }
                                return this.minioClient.putObject(
                                    'tdh.genarate-ticket',
                                    `TDH-${uid}.png`,
                                    result?.data!,
                                    metaData,
                                ).then(
                                    (res) => {
                                        this.logger.log(res)
                                        console.timeEnd(uid)
                                        return res
                                    })

                            });
                    })
                    // )
                } catch (e) {
                    this.logger.error(":: Error genImage function ")
                    this.logger.error(e)
                    // throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR)
                }
            }
        )

    }
}
