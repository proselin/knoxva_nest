import {randomUUID} from "crypto";
import {Quality} from "@shared/utils/constant";
import {Client} from "minio";
import {Inject, Injectable, Logger} from "@nestjs/common";
import {IReplaceObject} from "@shared/types/genImage.type";
import {KonvaGen} from "@shared/entities/konva-gen";
import {MINIO_CONNECTION} from "nestjs-minio";
import {getEnvOrThrow} from "@shared/utils/functions";
import {CONFIG_NAME} from "@shared/utils/enums";


@Injectable()
export class GenerateImageService {

    readonly SAVE_BUCKET = getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_MINIO_BUCKET_NAME)
    logger = new Logger(GenerateImageService.name)

    constructor(
        @Inject(MINIO_CONNECTION) private readonly minioClient: Client
    ) { }

    genImage(
        template: string,
        options: IReplaceObject[],
        genQuality: Quality = Quality.Normal
    ) {
        return this.handleEvent({ template, options, Quality: genQuality })
    }


    handleEvent({ template, options, Quality }: any) {
        Logger.log(":: Enter genImage function ")
        return this.initTemplate(template, options).then(
            (konvaGen) => {
                try {
                    return Promise.all(options.map((option) => {

                        const uid = randomUUID()

                        let localKonva = new KonvaGen(konvaGen.getStage())
                        return this.genOneOptions(option, localKonva, Quality).then(
                            (result) => this.saveTicket({ konvaGen: result, Quality, uid })
                        );

                    })).then(
                        (res) => {

                            konvaGen.clean()
                            return res

                        }
                    )

                } catch (e) {
                    this.logger.error("Error genImage function", GenerateImageService.name)
                    this.logger.error(e, GenerateImageService.name)
                }
            })
    }


    async saveTicket({ konvaGen, Quality, uid }: {
        konvaGen: KonvaGen,
        Quality: Quality,
        uid: string,
    }) {

        const response = await konvaGen.toImage(Quality) as any;
        const result = <{ type: string; data: Buffer; }>this.decodeBase64Image(response['src']);
        const metaData: Parameters<typeof Client.prototype.putObject>[3] = {
            "Content-Encoding": 'base64',
            "Content-Type": result?.type
        };
        return await new Promise((resolve, reject) => {
           return this.minioClient.putObject(
                this.SAVE_BUCKET,
                `TDH-${uid}.png`,
                (result?.data)!,
                metaData
            ).then(
                (res) => {

                    this.logger.log("Minio push object response :", GenerateImageService.name)
                    this.logger.log(res, GenerateImageService.name)

                    /**
                     * Clean konva object
                     */
                    konvaGen.clean();

                    console.timeEnd(uid);

                    resolve(`TDH-${uid}.png`);
                })
                .catch(err => {
                    this.logger.log("Minio push object error response :", GenerateImageService.name)
                    this.logger.log(err, GenerateImageService.name)
                    reject(err)
                })
        })
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


    genOneOptions(option: IReplaceObject, konvaGen: KonvaGen, genQuality: Quality): Promise<KonvaGen> {
        this.logger.log("Enter genOneOptions function ", GenerateImageService.name)
        this.logger.log("GenQuality " + genQuality, GenerateImageService.name)
        this.logger.log("options " + JSON.stringify(option), GenerateImageService.name)
        return konvaGen.replaceObject(option).then(() => konvaGen)
    }

    async initTemplate(template: string | object, replaceOb: IReplaceObject[]): Promise<KonvaGen> {
        this.logger.log(":: Enter function initTemplate")
        this.logger.log(":: Template: " + typeof template == "string" ? template : JSON.stringify(template))
        const konvaGen = new KonvaGen(template)
        await konvaGen.reFormImages(replaceOb)
        Logger.log(":: Complete function initTemplate")
        return konvaGen
    }

}
