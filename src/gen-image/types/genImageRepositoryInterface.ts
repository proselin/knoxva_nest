import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenQuality} from "@gen-image/utils/constant";
import {KonvaGen} from "@gen-image/konva-gen";

export interface GenImageRepositoryInterface {
    genImage(
        template: string | object,
        options: GenImageReplaceObject[],
        genQuality: GenQuality
    ): Promise<any>

    initTemplate(imageId: string[], template: string | object): Promise<KonvaGen>

    writeFile(path: string, dataUrl: Buffer): Promise<any>

    genOneOptions(
        option: GenImageReplaceObject,
        konvaGen: KonvaGen,
        genQuality: GenQuality): Promise<any>

    genNewImagePath(type: string): string

    decodeBase64Image(dataString: string): Error | { type: string, data: Buffer }
}