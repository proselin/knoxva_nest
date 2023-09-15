import {Logger} from "@nestjs/common";
import {Image} from "konva/lib/shapes/Image";
import {Text} from "konva/lib/shapes/Text";
import {Node, Image as _Image} from 'konva';
const canvas = require('canvas')
class KonvaGen {
    constructor(options) {
        this.logger = new Logger(KonvaGen.name);
        this.constructStage(options);
    }

    constructStage(options) {
        this.logger.verbose(":: Create new KonvaGen ");
        if (!options)
            this.stage = Node.create({});
        try {
            if (typeof options == "string") {
                this.stage = Node.create(JSON.parse(options));
            } else if (typeof options == "object") {
                this.stage = Node.create(options);
            }
        } catch (e) {
            this.logger.error("Error in parse JSON");
            throw e;
        }
    }

    getStage() {
        return this.stage;
    }

    find(defined) {
        this.logger.verbose(":: Find elements: " + defined);
        return this.getStage().find(defined);
    }

    findIndex(defined) {
        this.logger.verbose(":: Find elements by Id: " + defined);
        return this.getStage().find(`#${defined}`);
    }

    async reFormImages() {
        this.logger.verbose(":: Enter Reform Image ");
        const imagesId = this.stage.find('Image')
            .filter(value => !!value?.getAttr('source'));
        this.logger.verbose("Image length ", imagesId.length);
        const imageMatrix = await Promise.all(imagesId.map(value => this.reFormSingleImage(value)));
        let rs = [];
        imagesId.forEach((image, index) => {
            rs.push(imageMatrix[index]);
        });
        this.logger.verbose(":: Complete Reform Image " + JSON.stringify(rs));
        return rs;
    }

    reFormImage(imageId) {
        const imageEl = this.findIndex(imageId);
        if (!imageEl.length) {
            throw new Error("ID did not exists!");
        }
        return Promise.all(imageEl.map(value => this.reFormSingleImage(value)));
    }

    reFormSingleText(node, value, isStrict = false) {
        return new Promise((resolve, reject) => {
            if (!node.attrs['text']) {
                !isStrict ? resolve() : reject();
            }
            if (node instanceof Text) {
                node.setText(value);
                node.fontFamily('Arial');
            }
            resolve();
        });
    }

    reFormSingleImage(node, option) {
        return new Promise((resolve, reject) => {
            if (!node.attrs['source'] && !option?.value) {
                !option?.isStrict ? resolve({}) : reject();
            }
            const url = option?.value ?? node.attrs['source'];
            _Image.fromURL(url, (source) => {
                if (node instanceof Image) {
                    node.image(source.getAttr('image'));
                }
                resolve(Image);
            }, (error) => {
                reject(error);
            });
        });
    }

    toDataUrl(quality, option) {
        let config = {
            pixelRatio: this.getQualityNumber(quality),
        };
        option && (config = {...option});
        return (this.stage.toDataURL(config));
    }

    toImage(quality, option) {
        let config = {
            pixelRatio: this.getQualityNumber(quality),
        };
        option && (config = {...option});
        return this.stage.toImage(config);
    }

    getQualityNumber(quality) {
        switch (quality) {
            case "ultra":
                return 3;
            case "good":
                return 2;
            case "normal":
                return 1;
            case "mini":
                return 0.5;
            default:
                return 1;
        }
    }

    setSize([width, height]) {
        if (!this.stage)
            this.stage = Node.create({width, height,});
        if (this.stage) {
            this.stage.attrs.width = width;
            this.stage.attrs.height = height;
        }
    }

    draw() {
        return this.stage.draw();
    }

    async replaceObject(object) {
        this.logger.verbose(":: Enter replaceObject function ");
        this.logger.verbose(":: Replace params " + JSON.stringify(object));
        for (const [key, value] of Object.entries(object)) {
            for (const node of this.findIndex(key)) {
                await this.replaceSingle(node, value);
            }
        }
    }

    async replaceSingle(node, value) {
        this.logger.verbose(":: Enter replaceSingle params " + value);
        switch (node.getClassName()) {
            case 'Image':
                await this.reFormSingleImage(node, {value});
                break;
            case 'Text':
                await this.reFormSingleText(node, value);
                break;
        }
    }
}

const _KonvaGen = KonvaGen;
export {_KonvaGen as KonvaGen};