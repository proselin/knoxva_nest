import {Injectable} from "@nestjs/common";
import {InjectQueue} from "@nestjs/bull";
import {Job, JobOptions, Queue} from "bull";
import {GenerateImageDTO} from "@shared/dtos/generateImageDTO";
import {CONFIG_NAME} from "@shared/utils/enums";
import {getEnvOrThrow} from "@shared/utils/functions";

type JobBulk = Array<{
    name?: string | undefined;
    data: GenerateImageDTO;
    opts?: Omit<JobOptions, 'repeat'> | undefined;
}>

@Injectable()
export class GenerateImageProducer {

    readonly ATTEMPTS = getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_ATTEMPTS, 3)
    readonly DELAY = getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_DELAY, 3000)
    readonly BACKOFF_TYPE = getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_BACKOFF_TYPE, 'exponential')
    readonly BACKOFF_DELAY = getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_BACKOFF_DELAY, 1000)
    readonly MAX_IMAGE_PER_JOB = +getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_MAX_GENERATE_PER_JOB)

    constructor(
        @InjectQueue(getEnvOrThrow(CONFIG_NAME.GEN_IMAGE_QUEUE_NAME))
        private generateImageQueue: Queue<any>,
    ) {
    }

    async addJob(generateParams: GenerateImageDTO) {

        if (!generateParams.options.length) return

        const jobArr: JobBulk = []
        const jobOptions: JobOptions = {
            attempts: +this.ATTEMPTS,
            delay: +this.DELAY,
            backoff: {
                type: this.BACKOFF_TYPE,
                delay: +this.BACKOFF_DELAY,
            },
        }
        /**
         * Dùng while để lấy hết tất cả các phần tử trong mảng options
         * Đối với mỗi JOB được add sẽ có tối đa các image được gen trong một job
         */
        do {
            const job: JobBulk[0] = {
                data: {
                    genQuality: generateParams.genQuality,
                    options: generateParams.options.splice(0, this.MAX_IMAGE_PER_JOB),
                    template: generateParams.template
                },
                opts: jobOptions
            }
            jobArr.push(job)
        } while (generateParams.options.length > 0)

        /**
         * Thêm vào trong queue
         */
        await this.generateImageQueue.addBulk(jobArr)
    }
}