import {Logger} from "@nestjs/common";
import {Node, NodeConfig} from "konva/lib/Node";
import {DEFINED_TYPE_ATTRIBUTE, GenQuality} from "@gen-image/utils/constant";
import {GenImageReplaceObject, ToDataUrlConfig, ToImageConfig} from "@gen-image/types/genImage";
import {Image} from "konva/lib/shapes/Image";
import {Stage} from "konva/lib/Stage";
import {Text} from "konva/lib/shapes/Text";
const Konva = require('konva')

export class KonvaGen {
    private stage: Stage;


    constructor(
        options?: string | object
    ) {
        this.constructStage(options)
    }

    constructStage(options?: string | object) {
        if (!options) this.stage = Konva.Node.create({})

        try {
            if (typeof options == "string") {
                this.stage = Konva.Node.create(JSON.parse(options));
            } else if (typeof options == "object") {
                this.stage = Konva.Node.create(options);
            }
        } catch (e) {
            Logger.error("Error in parse JSON");
            throw e;
        }
    }

    getStage(): Stage {
        return this.stage
    }

    find(defined: string) {
        return this.getStage().find(defined)
    }

    findIndex(defined: string) {
        return this.getStage().find(`#${defined}`)
    }

    async reFormImages(imagesId: string[]): Promise<{ [p: string]: ({} | Image)[] }> {
        const imageMatrix = await Promise.all(imagesId.map(value => this.reFormImage(value)))
        let rs: { [p: string]: ({} | Image)[] } = {}
        imagesId.forEach(
            (image, index) => {
                rs[image] = imageMatrix[index]
            }
        )
        return rs
    }

    reFormImage(imageId: string): Promise<({} | Image)[]> {
        const imageEl = this.findIndex(imageId)

        if (!imageEl.length) {
            throw new Error("ID did not exists!")
        }

        return Promise.all(imageEl.map(value => this.reFormSingleImage(value)))
    }

    reFormSingleText(node: Node<NodeConfig>, value: string, isStrict: boolean = false) {
        return new Promise<void>(
            (resolve, reject) => {
                if (!node.attrs['text'] ) {
                    !isStrict ? resolve() : reject()
                }
                if(node instanceof Text){
                    node.setText(value)
                    node.fontFamily('Century Gothic')
                    resolve()
                }

            }
        )
    }

    private reFormSingleImage(node: Node<NodeConfig>, option?: { value?: string, isStrict?: boolean }) {
        return new Promise<{} | Image>((resolve, reject) => {

            if (!node.attrs['source'] && !option?.value) {
                !option?.isStrict ? resolve({}) : reject()
            }
            const url = option?.value || node.attrs['source']
            Konva.Image.fromURL(url,
                (source: Image) => {
                  if(node instanceof  Image) {
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


    async replaceObject(object: GenImageReplaceObject) {
        for (const [key, value] of Object.entries(object)) {
            for (const node of this.findIndex(key)) {
                await this.replaceSingle(node, value);
            }
        }
    }


    async replaceSingle(node: Node<NodeConfig>, value: any) {
        switch (node.attrs[DEFINED_TYPE_ATTRIBUTE]) {
            case 'image':
                await this.reFormSingleImage(node, {value})
                break
            case 'text':
                await this.reFormSingleText(node, value)
                break
        }
    }


}

