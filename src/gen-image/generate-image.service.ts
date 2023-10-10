import {randomUUID} from "crypto";
import {GenQuality} from "./utils/constant";
import {Client} from "minio";
import {Logger} from "@nestjs/common";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import { KonvaGen } from "./konva-gen";


export async function genImage(
    template: string,
    options: GenImageReplaceObject[],
    genQuality: GenQuality = GenQuality.Normal
) {
    return handleEvent({template, options, Quality: genQuality})
}

function handleEvent({template, options, Quality}: any) {
    Logger.log(":: Enter genImage function ")
    const uidMain = randomUUID()
    return initTemplate(template, options).then(
        (konvaGen) => {
            try {
                return Promise.all(options.map((option) => {
                    const uid = randomUUID()
                    // console.time(uid)
                    let localKonva = new KonvaGen(konvaGen.getStage())
                    return genOneOptions(option, localKonva, Quality).then((result) => {
                        return saveTicket({konvaGen: result, Quality, uid})
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


async function saveTicket({konvaGen, Quality, uid}: {
    konvaGen: KonvaGen,
    Quality: GenQuality,
    uid: string,
}) {

    const response = await konvaGen.toImage(Quality) as any;
    const result = <{ type: string; data: Buffer; }>decodeBase64Image(response['src']);
    const metaData: Parameters<typeof Client.prototype.putObject>[3] = {
        "Content-Encoding": 'base64',
        "Content-Type": result?.type
    };
    return await new Promise(async (resolve) => {
        resolve("OKE")
        // minio.putObject(
        //     'tdh.genarate-ticket',
        //     `TDH-${uid}.png`,
        //     (result?.data)!,
        //     metaData, (res) => {
        //         if (res instanceof Error) {
        //             return
        //         }
        //         Logger.info(res);
        //         konvaGen.clean();
        //         console.timeEnd(uid);
        //         resolve(`TDH-${uid}.png`);
        //     });
    });
}

function decodeBase64Image(dataString: string): Error | { type: string; data: Buffer } {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)!;
    const response: Partial<{ type: string, data: Buffer }> = {}

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], 'base64')

    return <{ type: string, data: Buffer }>response;
}

function genOneOptions(option: GenImageReplaceObject, konvaGen: KonvaGen, genQuality: GenQuality) {
    Logger.log(":: Enter genOneOptions function ")
    Logger.log(":: GenQuality " + genQuality)
    Logger.log(":: options " + JSON.stringify(option))
    const key = randomUUID()
    // console.time(key)

    return konvaGen.replaceObject(option).then(
        () => konvaGen
    )
}

async function initTemplate(template: string | object, replaceOb: GenImageReplaceObject[]): Promise<KonvaGen> {
    Logger.log(":: Enter function initTemplate")
    Logger.log(":: Template: " + typeof template == "string" ? template : JSON.stringify(template))
    const konvaGen = new KonvaGen(template)
    await konvaGen.reFormImages(replaceOb)
    Logger.log(":: Complete function initTemplate")
    return konvaGen
}
