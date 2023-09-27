import {OnQueueActive, OnQueueCompleted, Process, Processor} from "@nestjs/bull";
import {Job} from "bull";
import {InputGenerateImageParams} from "@gen-image/types/genImage";
import {GenImageService} from "@gen-image/gen-image.service";
import {Logger} from "@nestjs/common";

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
        return {};
    }

    @OnQueueActive()
    onActive(job: Job) {
        Logger.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }

    @OnQueueCompleted()
    onComplete() {
        Logger.log("DONE")
    }




}


