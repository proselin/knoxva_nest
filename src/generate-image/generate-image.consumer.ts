import { OnGlobalQueueError, OnQueueActive, OnQueueCompleted, Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { InputGenerateImageParams, IReplaceObject } from "../shared/types/genImage.type";
import { Inject, Logger } from "@nestjs/common";
import child from "child_process";
import { Quality } from "../shared/utils/constant";
import { ForkProcessService } from "../generate-image-child-process/fork-process.service";
import { randomUUID } from "crypto";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";


@Processor('generate-ticket')
export class GenerateImageConsumer {

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private readonly genImageProcess: ForkProcessService
    ) {
    }

    @Process()
    async generateImageJob(job: Job<InputGenerateImageParams>) {
        const progress = 100;
        await job.progress(progress);
        const uidMain = randomUUID()
        console.time(uidMain)
        return await this.sendToChildProcess(
            job.data.template,
            job.data.options,
            job.data.genQuality
        ).then((rs: string[]) => {
            this.logger.log(rs, "End Process Child")
            global?.gc && global.gc()
            console.timeEnd(uidMain)
            return rs
        })
    }

    sendToChildProcess(template: string, obReplace: IReplaceObject[], genQuality: Quality) {
        this.logger.log("Start child process")
        return new Promise((resolve, reject) => {
            try {
                const childProcess: child.ChildProcess = this.genImageProcess.getForkedNestJsGenImageChildModule()
                if (childProcess) {

                    const callBack = (value: child.Serializable) => {
                        childProcess?.removeListener('message', callBack)
                        resolve(value)
                    }

                    childProcess.addListener('message', callBack)
                    childProcess.send({
                        command: "generateImage",
                        template,
                        replaceObj: obReplace,
                        quality: genQuality
                    })
                }
            } catch (e) {
                reject(e)
            }

        })
    }

    @OnQueueActive()
    onActive(job: Job) {
        console.time(job.id + "")
        Logger.verbose(`Processing job ${job.id} of type ${job.name}`, GenerateImageConsumer.name);
    }

    @OnQueueCompleted()
    onComplete(job: Job) {
        Logger.verbose(`Done job ${job.id} of type ${job.name}`, GenerateImageConsumer.name);
        console.timeEnd(job.id + "")

    }

    @OnGlobalQueueError()
    onError(job: Job) {
        Logger.error(`Error job ${job.id} of type ${job.name}`, GenerateImageConsumer.name);
        console.timeEnd(job.id + "")
    }

}


