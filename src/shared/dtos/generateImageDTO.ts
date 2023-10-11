import { IReplaceObject } from "../types/genImage.type"
import { Quality } from "../utils/constant"
import {IsArray, IsString} from "class-validator"

export class GenerateImageDTO {

    @IsString()
    genQuality: Quality

    @IsArray()
    options: IReplaceObject[]

    @IsString()
    template: string

}
