import {parentPort, threadId} from "worker_threads";
import {GenImageService} from "./genImage.service";
import {Logger} from "@nestjs/common";


parentPort.on('message', async (task) => {
    const {template, option, genQuality} = task
    console.log(`running task on thread: ${threadId}`)

    const service = new GenImageService()
    try {
        await service.genImage(template, option, genQuality)
    } catch (e) {
        Logger.log('Error', e)
    }

    parentPort.postMessage(option)
})


