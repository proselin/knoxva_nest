import {Injectable, Logger} from "@nestjs/common";
import { fork } from "node:child_process";
const path = require("path")
import * as child from "child_process"


@Injectable()
export class ForkProcessService {
    private genImageForkedProcess: child.ChildProcess | null = null


    getForkedNestJsGenImageChildModule() {
        if (!this.genImageForkedProcess || !this.genImageForkedProcess.connected) {
            this.genImageForkedProcess = fork(path.resolve(__dirname, './worker'));
            Logger.log("Child Process Start at PID " + this.genImageForkedProcess.pid)
        }

        return this.genImageForkedProcess;
    }
}