import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // 기존처럼 시원하게 위아래 마진 확보
        const margin = '\n'.repeat(8);
        
        console.error(margin);
        console.error('======================= 🔥 ERROR DETAIL 🔥 =======================');
        
        // 1. 에러 메시지 (무엇이 잘못되었나?)
        console.error(`▶ MESSAGE: ${err.message || err}`);
        
        // 2. 에러 코드 (gRPC나 HTTP 상태 코드)
        if (err.code) console.error(`▶ CODE: ${err.code}`);

        console.error('------------------------------------------------------------------');
        
        // 3. 스택 트레이스 (어디서 터졌나? 핵심만!)
        if (err.stack) {
          // node_modules 관련 지저분한 라인은 제외하고 내 코드 위주로 출력
          const cleanStack = err.stack
            .split('\n')
            .filter((line: string) => !line.includes('node_modules'))
            .slice(0, 5) // 너무 길면 보기 힘드니 상단 5줄만
            .join('\n');
          
          console.error('▶ CLEAN STACK:');
          console.error(cleanStack);
        }

        console.error('==================================================================');
        console.error(margin);

        return throwError(() => err);
      }),
    );
  }
}