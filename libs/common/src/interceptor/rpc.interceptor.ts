import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable()
export class RpcInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const rpcContext = context.switchToRpc();
        const tcpContext = rpcContext.getContext();
        
        let cmd = 'unknown';
        
        try {
            // TcpContext의 args[1]에서 JSON 문자열 파싱
            if (tcpContext.args && tcpContext.args[1]) {
                const pattern = JSON.parse(tcpContext.args[1]);
                cmd = pattern.cmd || 'unknown';
            }
        } catch (error) {
        }

        return next.handle()
            .pipe(
                map((data) => {
                    const resp = {
                        status: 'success',
                        data,
                    };
                    console.log('RpcInterceptor success | cmd: ' + cmd, resp);

                    return resp;
                }),
                catchError((err) => {
                    const resp = {
                        status: 'error',
                        error: err,
                    };
                    console.log('RpcInterceptor error | cmd: ' + cmd, resp);

                    return throwError(() => new RpcException(err));
                })
            )
    }
}