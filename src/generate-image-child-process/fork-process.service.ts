import {Injectable, Logger} from "@nestjs/common";
import { fork } from "node:child_process";
import * as child from "child_process"
import { resolve } from "node:path";


@Injectable()
export class ForkProcessService {
    private genImageForkedProcess: child.ChildProcess | null = null

    getForkedNestJsGenImageChildModule() {
        if (!this.genImageForkedProcess || !this.genImageForkedProcess.connected) {
            this.genImageForkedProcess = fork(resolve(__dirname, './worker'));
            Logger.log("Child Process Start at PID " + this.genImageForkedProcess.pid)
        }

        return this.genImageForkedProcess;
    }
}