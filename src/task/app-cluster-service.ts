// import * as cluster from 'node:cluster';
import * as os from 'os';
import {Injectable, Logger} from '@nestjs/common';
const cluster =  require('node:cluster');

// const numCPUs = os.cpus().length;
const numCPUs = 1
@Injectable()
export class AppClusterService {
    static logger = new Logger(AppClusterService.name)
    static clusterRise(callback: Function): void {
        if(cluster.isPrimary){
            AppClusterService.logger.verbose(`Master server started on ${process.pid}`);
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }
            cluster.on('exit', (worker: any, code: any, signal: any) => {
                AppClusterService.logger.verbose(`Worker ${worker.process.pid} died. Restarting`);
                cluster.fork();
            })
        } else {
            AppClusterService.logger.verbose(`Cluster server started on ${process.pid}`)
            callback();
        }
    }
}