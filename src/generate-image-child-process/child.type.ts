import {IReplaceObject} from "../shared/types/genImage";
import {Quality} from "../shared/utils/constant";

export type PassDataChild = {
    command: "generateImage",
    template: string,
    replaceObj: IReplaceObject[],
    quality: Quality
}