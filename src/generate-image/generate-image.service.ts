import {randomUUID} from "crypto";
import {Quality} from "@shared/utils/constant";
import {Client} from "minio";
import {Inject, Injectable, Logger} from "@nestjs/common";
import {IReplaceObject} from "@shared/types/genImage.type";
import {KonvaGen} from "@shared/entities/konva-gen";
import {MINIO_CONNECTION} from "nestjs-minio";


@Injectable()
export class GenerateImageService {

    Logger = new Logger(GenerateImageService.name)

    constructor(
        @Inject(MINIO_CONNECTION) private readonly minioClient: Client
    ) {}

    genImage(
        template: string,
        options: IReplaceObject[],
        genQuality: Quality = Quality.Normal
    ) {
        return this.handleEvent({template, options, Quality: genQuality})
    }


    handleEvent({template, options, Quality}: any) {
        Logger.log(":: Enter genImage function ")
        const uidMain = randomUUID()
        return this.initTemplate(template, options).then(
            (konvaGen) => {
                try {
                    return Promise.all(options.map((option) => {
                        const uid = randomUUID()
                        // console.time(uid)
                        let localKonva = new KonvaGen(konvaGen.getStage())
                        return this.genOneOptions(option, localKonva, Quality).then((result) => {
                            return this.saveTicket({konvaGen: result, Quality, uid})
                        });
                    })).then(
                        (res) => {
                            konvaGen.clean()
                            return res
                        }
                    )

                } catch (e) {
                    Logger.error(":: Error genImage function ")
                    Logger.error(e)
                }
            })
    }


    async saveTicket({konvaGen, Quality, uid}: {
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
        return await new Promise(async (resolve) => {
            this.minioClient.putObject(
                'tdh.generate-image',
                `TDH-${uid}.png`,
                (result?.data)!,
                metaData
            ).then(
                (res) => {
                    Logger.log(res);
                    konvaGen.clean();
                    console.timeEnd(uid);
                    resolve(`TDH-${uid}.png`);
                })
        });
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


    genOneOptions(option: IReplaceObject, konvaGen: KonvaGen, genQuality: Quality) {
        Logger.log(":: Enter genOneOptions function ")
        Logger.log(":: GenQuality " + genQuality)
        Logger.log(":: options " + JSON.stringify(option))
        return konvaGen.replaceObject(option).then(
            () => konvaGen
        )
    }

    async initTemplate(template: string | object, replaceOb: IReplaceObject[]): Promise<KonvaGen> {
        Logger.log(":: Enter function initTemplate")
        Logger.log(":: Template: " + typeof template == "string" ? template : JSON.stringify(template))
        const konvaGen = new KonvaGen(template)
        await konvaGen.reFormImages(replaceOb)
        Logger.log(":: Complete function initTemplate")
        return konvaGen
    }

}