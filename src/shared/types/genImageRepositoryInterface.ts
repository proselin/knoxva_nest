import {IReplaceObject} from "./genImage";
import {Quality} from "../utils/constant";
import {KonvaGen} from "../entities/konva-gen";

export interface GenImageRepositoryInterface {
    genImage(
        template: string | object,
        options: IReplaceObject[],
        genQuality: Quality
    ): Promise<any>

    initTemplate(imageId: string[], template: string | object): Promise<KonvaGen>

    writeFile(path: string, dataUrl: Buffer): Promise<any>

    genOneOptions(
        option: IReplaceObject,
        konvaGen: KonvaGen,
        genQuality: Quality): Promise<any>

    genNewImagePath(type: string): string

    decodeBase64Image(dataString: string): Error | { type: string, data: Buffer }
}