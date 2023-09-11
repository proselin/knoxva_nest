import {Logger} from "@nestjs/common";
import {Node, NodeConfig} from "konva/lib/Node";
import {DEFINED_TYPE_ATTRIBUTE, GenQuality} from "@gen-image/utils/constant";
import {GenImageReplaceObject, ToDataUrlConfig, ToImageConfig} from "@gen-image/types/genImage";
import {Image} from "konva/lib/shapes/Image";
import {Stage} from "konva/lib/Stage";
import {Text} from "konva/lib/shapes/Text";
import {catchError, forkJoin, from, Observable, of, tap} from "rxjs";
import * as console from "console";

const Konva = require('konva')

export class KonvaGen {

    private readonly logger = new Logger(KonvaGen.name)
    private stage: Stage;


    constructor(
        options?: string | object
    ) {
        this.constructStage(options)
    }

    constructStage(options?: string | object) {
        this.logger.log(":: Create new KonvaGen ")


        if (!options) this.stage = Konva.Node.create({})

        try {
            if (typeof options == "string") {
                this.stage = Konva.Node.create(JSON.parse(options));
            } else if (typeof options == "object") {
                this.stage = Konva.Node.create(options);
            }
        } catch (e) {
            this.logger.error("Error in parse JSON");
            throw e;
        }
    }

    getStage(): Stage {
        return this.stage
    }

    find(defined: string) {
        this.logger.log(":: Find elements: " + defined,)
        return this.getStage().find(defined)
    }

    findIndex(defined: string) {
        this.logger.log(":: Find elements by Id: " + defined,)
        return this.getStage().find(`#${defined}`)
    }

    async reFormImages(imagesId: string[]) {
        this.logger.log(":: Enter Reform Image ")
        this.logger.log(JSON.stringify(imagesId))
         for (const value of imagesId) {
             await this.reFormImage(value);
         }
        // let rs: { [p: string]: ({} | Image)[] } = {}
        // // imagesId.forEach(
        // //     (image, index) => {
        // //         rs[image] = imageMatrix[index]
        // //     }
        // // )
        // this.logger.log(":: Complete Reform Image " + JSON.stringify(rs))
        // // return rs
    }

    reFormImage(imageId: string) {
        const imageEl = this.findIndex(imageId)

        if (!imageEl.length) {
            throw new Error("ID did not exists!")
        }

       return  Promise.all(imageEl.map(value => this.reFormSingleImage(value)))
    }

    reFormSingleText(node: Node<NodeConfig>, value: string, isStrict: boolean = false) {
        return new Promise<void>(
            (resolve, reject) => {
                if (!node.attrs['text']) {
                    !isStrict ? resolve() : reject()
                }
                if (node instanceof Text) {
                    node.setText(value)
                    node.fontFamily('Arial')
                    resolve()
                }
            })
    }

    private reFormSingleImage(node: Node<NodeConfig>, option?: { value?: string, isStrict?: boolean }) {
        return new Promise<{} | Image>((resolve, reject) => {

            if (!node.attrs['source'] && !option?.value) {
                !option?.isStrict ? resolve({}) : reject()
            }
            const url = option?.value || node.attrs['source']
            Konva.Image.fromURL(url,
                (source: Image) => {
                    if (node instanceof Image) {
                        node.image(source.getAttr('image'))
                    }
                    resolve(Image)
                },
                (error: any) => {
                    reject(error)
                })
        })
    }

    toDataUrl(quality: GenQuality, option?: ToDataUrlConfig) {
        let config: ToDataUrlConfig = {
            pixelRatio: this.getQualityNumber(quality),
        }
        option && (config = {...option})
        return (this.stage.toDataURL(config))
    }

    toImage(quality: GenQuality, option?: ToImageConfig) {
        let config: ToImageConfig = {
            pixelRatio: this.getQualityNumber(quality),
        }
        option && (config = {...option})
        return this.stage.toImage(config)
    }

    private getQualityNumber(quality: GenQuality) {
        switch (quality) {
            case "ultra":
                return 3
            case "good":
                return 2
            case "normal":
                return 1
            case "mini":
                return 0.5
            default:
                return 1
        }
    }

    setSize([width, height]: [number, number]) {
        if (!this.stage) this.stage = Konva.Node.create({width, height,});
        if (this.stage) {
            this.stage.attrs.width = width
            this.stage.attrs.height = height
        }
    }

    draw() {
        return this.stage.draw()
    }


    replaceObject(object: GenImageReplaceObject, cb: () => any) {
        this.logger.log(":: Enter replaceObject function ")
        this.logger.log(":: Replace params " + JSON.stringify(object))
        const pro: Promise<any>[] = []
        for (const [key, value] of Object.entries(object)) {
            for (const node of this.findIndex(key)) {
                pro.push(this.replaceSingle(node, value))
            }
        }
        Promise.all(pro).then(() => cb())
    }


    //  replaceSingle(node: Node<NodeConfig>, value: any) {
    //     this.logger.log(":: Enter replaceSingle params" + value)
    //     switch (node.attrs[DEFINED_TYPE_ATTRIBUTE]) {
    //         case 'image':
    //              this.reFormSingleImage(node, value).subscribe()
    //             break
    //         case 'text':
    //              this.reFormSingleText(node, value)
    //             break
    //     }
    // }

    replaceSingle(node: Node<NodeConfig>, value: any) {
        this.logger.log(":: Enter replaceSingle params" + value)
        switch (node.className) {
            case "Image":
                return this.reFormSingleImage(node, value)
            case 'Text':
                return this.reFormSingleText(node, value)
            default:
                return new Promise<undefined>(resolve => resolve(undefined))
        }
    }


}

