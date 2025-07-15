import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable()
export class RpcInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle()
            .pipe(
                map((data) => {
                    const resp = {
                        status: 'success',
                        data,
                    };
                    console.log('RpcInterceptor success ', resp);

                    return resp;
                }),
                catchError((err) => {
                    const resp = {
                        status: 'error',
                        error: err,
                    };
                    console.log('RpcInterceptor error ', resp);

                    return throwError(() => new RpcException(err));
                })
            )
    }
}