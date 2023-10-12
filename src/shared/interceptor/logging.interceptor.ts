import {CallHandler, ExecutionContext, Logger, NestInterceptor} from '@nestjs/common';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        Logger.log(`[${context.getHandler().name}]::` + `[via :${context.getType()}]::` + "Incomming resquest ", context.getClass().name)
        const now = Date.now();
        return next
            .handle()
            .pipe(
                tap({
                    next: () => {
                        Logger.log(`[${context.getHandler().name}]::` + `[${context.getType()}]::` + "Request commplete in  " + `${Date.now() - now}ms`, context.getClass().name)
                    },
                    error: (err) => {
                        Logger.error(`[${context.getHandler().name}]::` + `[${context.getType()}]::` + "Request error in  " + `${Date.now() - now}ms`, context.getClass().name)
                        Logger.error(err, context.getClass().name)
                    }
                })
            );
    }
}