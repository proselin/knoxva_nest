import { GenImageReplaceObject } from "@gen-image/types/genImage"
import { GenQuality } from "@gen-image/utils/constant"
import { IsArray, IsObject, IsString } from "class-validator"


export class GenImageDTO {
    @IsString()
    genQuality: GenQuality

    @IsArray()
    options: GenImageReplaceObject[]
}