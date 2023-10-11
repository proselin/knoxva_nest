import {Quality} from "../utils/constant";
import {GenerateImageDTO} from "../dtos/generateImageDTO";

export type ToImageConfig = ExportConfig & {
    callback?: (img: any) => void;
}
export type ToDataUrlConfig = ExportConfig & {
    callback?: (src: string) => void;
}

type ExportConfig = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    pixelRatio?: number;
    mimeType?: string;
    quality?: number;
}
//
// export type replaceObject = {
//     replaceObject: GenImageReplaceObject
// }


export type IReplaceObject = {
    qr: string,
    [p: string]: string
}

export type InputGenerateImageParams = GenerateImageDTO
