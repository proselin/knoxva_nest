
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


export type GenImageReplaceObject = {
    qr: string,
    [p: string]: string
}

export type DecodeBase64Response = { type: string, data: Buffer }
