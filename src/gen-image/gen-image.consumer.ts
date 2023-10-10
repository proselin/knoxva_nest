import {OnGlobalQueueError, OnQueueActive, OnQueueCompleted, Process, Processor} from "@nestjs/bull";
import {Job} from "bull";
import {InputGenerateImageParams} from "@gen-image/types/genImage";
import {Logger} from "@nestjs/common";
import * as console from "console";
import {genImage} from "./generate-image.service";

@Processor('generate-ticket')
export class GenImageConsumer {

    // constructor(private genImageService: GenImageService) {
    // }

    @Process()
    async generateImageJob(job: Job<InputGenerateImageParams>) {
        const progress = 100;
        await job.progress(progress);
        return genImage(
            job.data.template,
            job.data.options,
            job.data.genQuality
        ).then(
            () =>  global?.gc && global.gc()
        );
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


