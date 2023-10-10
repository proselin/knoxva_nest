import { IReplaceObject } from "../types/genImage"
import { Quality } from "../utils/constant"
import {IsArray, IsString} from "class-validator"

export class GenImageDTO {
    @IsString()
    genQuality: Quality

    @IsArray()
    options: IReplaceObject[]

    @IsString()
    template: string
}
