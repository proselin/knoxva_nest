import { GenImageRepository } from "@gen-image/gen-image.repository";
import { GenImageReplaceObject } from "@gen-image/types/genImage";
import { GenQuality } from "@gen-image/utils/constant";
import { HttpException, HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { KonvaGen } from "./konva-gen";
import { MINIO_CONNECTION } from "nestjs-minio";
import { Client } from 'minio';
import { randomUUID } from "crypto";


@Injectable()
export class GenImageService {
    private readonly logger = new Logger(GenImageService.name)
    repository = new GenImageRepository()


    constructor(
        private eventEmitter: EventEmitter2,
        @Inject(MINIO_CONNECTION) private readonly minioClient: Client
    ) {}


    async genImage(
        template: string,
        options: GenImageReplaceObject[],
        genQuality: GenQuality = GenQuality.Normal
    ) {
        this.eventEmitter.emit('order.gen', { template, options, genQuality })
    }

    @OnEvent('order.gen')
    async handleEvent({ template, options, genQuality }: any) {
        this.logger.log(":: Enter genImage function ")
        const konvaGen = await this.repository.initTemplate(template, options)
        try {
            // return Promise.all(
            options.forEach((option) => {
                const uid = randomUUID()
                console.time(uid)
                this.repository.genOneOptions(option, new KonvaGen(konvaGen.getStage()), genQuality)
                    .then((result) => {

                    const metaData: Parameters<typeof this.minioClient.putObject>[3] = {
                        "Content-Encoding": 'base64',
                        "Content-Type": result?.type
                    }
                     this.minioClient.putObject(
                        'tdh.genarate-ticket',
                        `TDH-${uid}.png`,
                        result?.data!,
                        metaData,
                    ).then(
                        (error) => {
                            this.logger.log(error)
                            console.timeEnd(uid)
                        }
                    )

                });
            })
            // )
        } catch (e) {
            this.logger.error(":: Error genImage function ")
            this.logger.error(e)
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
