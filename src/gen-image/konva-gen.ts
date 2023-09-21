import {Logger} from "@nestjs/common";
import {Node, NodeConfig} from "konva/lib/Node";
import {GenQuality} from "@gen-image/utils/constant";
import {GenImageReplaceObject, ToDataUrlConfig, ToImageConfig} from "@gen-image/types/genImage";
import {Image} from "konva/lib/shapes/Image";
import {Stage} from "konva/lib/Stage";
import {Text} from "konva/lib/shapes/Text";
import axios from "axios";
import e from "express";

const Konva = require('konva')

export class KonvaGen {

    private readonly logger = new Logger(KonvaGen.name)
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

    async reFormImages(replaceOb: GenImageReplaceObject[]) {
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

    }

    private reFormSingleImage(node: Node<NodeConfig>, value?: string) {

        return new Promise<void>((resolve, reject) => {
            if (!node.attrs['source'] && !value) {
                reject()
                return
            }
            const mime = 'image/png';
            const encoding = 'base64';

            const url = value ?? node.attrs['source']
            this.bufferImage(url).then((buffer) => {

                    const img = Konva.Util.createImageElement()
                    img.onload = (event) => {
                        (node as Image).image(img)
                        resolve()
                    }
                    img.onerror = (err) => {
                        reject(err)
                    }
                    img.crossOrigin = 'Anonymous';
                    img.src = 'data:' + mime + ';' + encoding + ',' + buffer.toString(encoding);
                }
            ).catch(err => reject(err))
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


    draw() {
        return this.stage.draw()
    }


    async replaceObject(object: GenImageReplaceObject) {
        this.logger.log(":: Enter replaceObject function ")
        this.logger.log(":: Replace params " + JSON.stringify(object))
        for (const [key, value] of Object.entries(object)) {
            const node = this.findIndex(key)?.[0]
            if (!node) continue;
            await this.replaceSingle(node, value);
        }
    }


    async replaceSingle(node: Node<NodeConfig>, value: any) {
        this.logger.log(":: Enter replaceSingle params " + value)
        switch (node.getClassName()) {
            case 'Image':
                return this.reFormSingleImage(node, value)
            case 'Text':
                return this.reFormSingleText(node, value)
        }
    }

    private bufferImage(url) {
        return axios
            .get(url, {
                responseType: 'arraybuffer'
            }).then(
                response => {
                    return Buffer.from(response.data);
                }
            );
    }

    buildImages() {
        this.getStage().find('Image').forEach(
            node => {
                // if (!!node.getAttr('image') || !node.getAttr('source')) return
                // node.setAttr('src', node.getAttr('source'))
            })
    }
}

