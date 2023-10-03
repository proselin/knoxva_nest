import {OnGlobalQueueError, OnQueueActive, OnQueueCompleted, Process, Processor} from "@nestjs/bull";
import {Job} from "bull";
import {InputGenerateImageParams} from "@gen-image/types/genImage";
import {GenImageService} from "@gen-image/gen-image.service";
import {Logger} from "@nestjs/common";
import * as console from "console";

@Processor('generate-ticket')
export class GenImageConsumer {

    constructor(private genImageService: GenImageService) {
    }

    @Process()
    async generateImageJob(job: Job<InputGenerateImageParams>) {
        const progress = 100;
        await this.genImageService.genImage(
            job.data.template,
            job.data.options,
            job.data.genQuality)
        await job.progress(progress);
        // await job.finished()
        return {};
    }

    @OnQueueActive()
    onActive(job: Job) {
        console.time(job.id + "")
        Logger.verbose(`Processing job ${job.id} of type ${job.name}`, GenImageConsumer.name);
    }

    @OnQueueCompleted()
    onComplete(job: Job) {
        Logger.verbose(`Done job ${job.id} of type ${job.name}`, GenImageConsumer.name);
        console.timeEnd(job.id + "")

    }

    @OnGlobalQueueError()
    onError(job: Job) {
        Logger.error(`Error job ${job.id} of type ${job.name}`, GenImageConsumer.name);
        console.timeEnd(job.id + "")
    }





}


