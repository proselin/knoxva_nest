import {OnGlobalQueueError, OnQueueActive, OnQueueCompleted, Process, Processor} from "@nestjs/bull";
import {Job} from "bull";
import {InputGenerateImageParams, IReplaceObject} from "../shared/types/genImage";
import {Logger} from "@nestjs/common";
import * as console from "console";
import child from "child_process";
import {Quality} from "../shared/utils/constant";
import {ForkProcessService} from "../generate-image-child-process/fork-process.service";
import {randomUUID} from "crypto";

@Processor('generate-ticket')
export class GenImageConsumer {

    constructor(private genImageProcess: ForkProcessService) {
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
        ).then(
            (rs: string[]) => {
                Logger.log(rs, "End Process Child")
                global?.gc && global.gc()
                console.timeEnd(uidMain)
                return rs
            }
        )
    }

    sendToChildProcess(template: string, obReplace: IReplaceObject[], genQuality: Quality) {
        return new Promise((resolve, reject) => {

            let childProcess: child.ChildProcess | null = null
            childProcess = this.genImageProcess.getForkedNestJsGenImageChildModule()
            if (childProcess) {
                const callBack = (value: child.Serializable) => {
                    console.log(value)
                    childProcess?.removeListener('message', callBack)
                    resolve(value)
                }
                childProcess?.addListener('message', callBack)
                childProcess?.send({
                    command: "generateImage",
                    template,
                    replaceObj: obReplace,
                    quality: genQuality
                })
            }
        })
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


