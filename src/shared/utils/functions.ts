import {Logger} from "@nestjs/common";
import * as process from "process";

export function getEnv(name: string, defaultValue?: string | number){
    if(Object.keys(process.env).includes(name)){
        return <string>process.env[name]
    }
    if(defaultValue){
        Logger.warn('Not found environment variable name ' + name  + 'fall back to default ' + defaultValue )
        return <NonNullable<string>>(defaultValue + "")
    }
    return undefined
}

export function getEnvOrThrow(name: string, defaultValue?: string | number){
    if(Object.keys(process.env).includes(name)){
        return <string>process.env[name]
    }
    if(defaultValue){
        Logger.warn(`Not found environment variable name ${name} fall back to default ${defaultValue}`, "GET_ENV" )
        return <NonNullable<string>>(defaultValue + "")
    }
    throw new Error(`Not Found Environment ${name}` )
}


