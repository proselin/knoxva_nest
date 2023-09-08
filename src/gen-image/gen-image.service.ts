import {HttpException, HttpStatus, Injectable, Logger} from "@nestjs/common";
import {KonvaGen} from "./konva-gen";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {writeFile} from "node:fs";
import {GenQuality} from "@gen-image/utils/constant";
import {join} from "node:path"
import * as path from "path";
import {GenImageRepository} from "@gen-image/gen-image.repository";

@Injectable()
export class GenImageService {
    private readonly logger = new Logger(GenImageService.name)
    repository = new GenImageRepository()

    async genImage(
        template: string | object,
        imageId: string[],
        options: GenImageReplaceObject[],
        genQuality: GenQuality = GenQuality.Normal
    ) {
        return this.repository.genImage(template, imageId, options, genQuality)
    }


}
