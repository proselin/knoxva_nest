import {Global, Injectable} from "@nestjs/common";
import {InjectQueue} from "@nestjs/bull";
import {Queue} from "bull";
import {GenImageReplaceObject} from "@gen-image/types/genImage";
import {GenQuality} from "@gen-image/utils/constant";

@Global()
@Injectable()
export class GenImageProducer {

    static readonly MAX_SIZE = 10

    constructor(
        @InjectQueue('generate-ticket')
        private generateImageQueue: Queue
    ) {
    }

    async addJob(
        template: string,
        options: GenImageReplaceObject[],
        genQuality: GenQuality
    ) {
        do {
            if (!options.length) return
            await this.generateImageQueue.add({
                    template,
                    options: options.splice(0, GenImageProducer.MAX_SIZE),
                    genQuality
                }, {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                }
            )
        } while (options.length > 0)
    }
}