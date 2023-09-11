import * as cluster from 'node:cluster';
import * as os from 'os';
import {Injectable} from '@nestjs/common';
// import cluster from 'cluster';

const numCPUs = os.cpus().length;

@Injectable()
export class AppClusterService {
    static clusterSize(callback: Function): void {
        // @ts-ignore
        if(cluster.isMaster){
            console.log(`Master server started on ${process.pid}`);
            for (let i = 0; i < numCPUs; i++) {
                // @ts-ignore
                cluster.fork();
            }
            // @ts-ignore
            cluster.on('exit', (worker, code, signal) => {
                console.log(`Worker ${worker.process.pid} died. Restarting`);
                // @ts-ignore
                cluster.fork();
            })
        } else {
            console.log(`Cluster server started on ${process.pid}`)
            callback();
        }
    }
}
