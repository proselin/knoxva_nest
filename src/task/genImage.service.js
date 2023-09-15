const common_1 = require("@nestjs/common");
const { KonvaGen }  = require("./konvaGen");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const node_cluster_1 = require("node:cluster");
const canvas = require('canvas')
export class GenImageService {
    constructor() {
        this.logger = new common_1.Logger(GenImageService.name);
    }
    decodeBase64Image(dataString) {
        const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = Buffer.from(matches[2], 'base64');
        return response;
    }
    async genImage(template, options, genQuality) {
        this.logger.log(":: Enter genImage function ")
        const konvaGen = await this.initTemplate(template)
        try {
            return Promise.all(options.map(option => this.genOneOptions(option, konvaGen, genQuality)))
        } catch (e) {
            this.logger.error(":: Error genImage function ")
            this.logger.error(e)
        }
    }
    async start(konvaGen, options, genQuality) {
        try {
            this.logger.log(":: Process ID :: ", node_cluster_1.default.worker.id);
        }
        catch (e) {
            this.logger.error(":: Error genImage function ");
            this.logger.error(e);
            throw new common_1.HttpException(e, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    genNewImagePath(type) {
        return (0, node_path_1.join)(__dirname, '..', 'assets', 'images_gen', `data${Date.now()}.${type.split('/')[1]}`);
    }
    genOneOptions(option, konvaGen, genQuality) {
        this.logger.verbose(":: Enter genOneOptions function ");
        this.logger.verbose(":: GenQuality " + genQuality);
        this.logger.verbose(":: options " + JSON.stringify(option));
        return new Promise(async (resolve, reject) => {
            await konvaGen.replaceObject(option);
            konvaGen.draw();
            const dataUrl = konvaGen.toDataUrl(genQuality);
            try {
                this.logger.verbose(":: genOneOptions DataUrl success ");
                const response = this.decodeBase64Image(dataUrl);
                const filePath = this.genNewImagePath(response.type);
                await this.writeFile(filePath, response.data).then(() => {
                    this.logger.log(":: SaveFile result at : " + filePath),
                        resolve(filePath);
                });
            }
            catch (e) {
                this.logger.error(":: genOneOptions Error");
                reject(e);
            }
        });
    }
    async initTemplate(template) {
        this.logger.verbose(":: Enter function initTemplate");
        this.logger.verbose(":: Template: " + typeof template == "string" ? template : JSON.stringify(template));
        const konvaGen = new KonvaGen(template);
        await konvaGen.reFormImages();
        this.logger.verbose(":: Complete function initTemplate");
        return konvaGen;
    }
    writeFile(path, dataUrl) {
        return new Promise((resolve, reject) => {
            (0, node_fs_1.writeFile)(path, dataUrl, (error) => {
                if (error) {
                    reject(error);
                }
                resolve(path);
            });
        });
    }
};