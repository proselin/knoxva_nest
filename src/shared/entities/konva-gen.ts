import {Logger} from "@nestjs/common";
import {Node, NodeConfig} from "konva/lib/Node";
import {Image} from "konva/lib/shapes/Image";
import {Stage} from "konva/lib/Stage";
import {Text} from "konva/lib/shapes/Text";
import { IReplaceObject, ToDataUrlConfig, ToImageConfig } from "../types/genImage.type";
import { Quality } from "../utils/constant";
import * as process from "process";

const Konva = require('konva')

export class KonvaGen {

    private _logger = new Logger(KonvaGen.name)
    logger = this._logger
    private stage: Stage;


    constructor(
        options?: any
    ) {
        if (options instanceof Stage) this.stage = options
        else this.constructStage(options)
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

    async reFormImages(replaceOb: IReplaceObject[]) {
        this.logger.log(":: Enter Reform Image ")
        const imagesId = (this.stage.find('Image') as Image[])
            .filter(value => !!value?.getAttr('source'))
            .filter(value => !(value.getAttr('id') in replaceOb[0]))
        this.logger.log("Image length", imagesId.length)
        await Promise.all(
            imagesId.map(value => this.reFormSingleImage(value))
        )
    }

    reFormSingleText(node: Node<NodeConfig>, value: string, isStrict: boolean = false) {

        if (node instanceof Text) {
            node.setText(value)
            node.fontFamily('Arial')
        }
        return Promise.resolve(value)

    }

    private reFormSingleImage(node: Node<NodeConfig>, value?: string) {

        return new Promise<void>((resolve, reject) => {
            if (!node.attrs['source'] && !value) {
                reject()
                return
            }

            const url = value ?? node.attrs['source']
            this.fromURL(url, (image: Image) => {
                node.setAttr('image', image.image())
                resolve(url)
                },
                err => reject(err)
            )
        })


    }

    fromURL(url: string, callback: Function, onError: Function | null = null) {
        let img = Konva.Util.createImageElement();
        img.onload = function () {
            let image = new Image({
                image: img,
            });
            process.nextTick(() => {
                global?.gc && global.gc()
                img.onload = null
                img.src = null
                img.onerror = null
            })
            callback(image);
        };
        img.onerror = onError;
        img.src = url;
    }

    toDataUrl(quality: Quality, option?: ToDataUrlConfig) {
        let config: ToDataUrlConfig = {
            pixelRatio: this.getQualityNumber(quality),
        }
        option && (config = {...option})
        return (this.stage.toDataURL(config))
    }

    toImage(quality: Quality, option?: ToImageConfig) {
        let config: ToImageConfig = {
            pixelRatio: this.getQualityNumber(quality),
        }
        option && (config = {...option})
        return this.stage.toImage(config)
    }

    private getQualityNumber(quality: Quality) {
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


    draw() {
        return this.stage.draw()
    }


     replaceObject(object: IReplaceObject) {
        this.logger.log(":: Enter replaceObject function ")
        this.logger.log(":: Replace params " + JSON.stringify(object))
        return Promise.all(Object.entries(object).map(([key, value]) => {
            const node = this.findIndex(key)?.[0]
            if (!node) return;
            return this.replaceSingle(node, value);
        }))
    }


     replaceSingle(node: Node<NodeConfig>, value: any) {
        this.logger.log(":: Enter replaceSingle params " + value)
        switch (node.getClassName()) {
            case 'Image':
                return this.reFormSingleImage(node, value)
            case 'Text':
                return this.reFormSingleText(node, value)
        }
    }


    clearCache() {
        this.stage.clearCache()
    }

    clear(){
        this.stage.clear()
    }

    destroy() {
        this.stage.destroy()
    }

    clean() {
        this.clear()
        this.clearCache()
        this.destroy()
        if (global?.gc) {global.gc();}
    }


}

