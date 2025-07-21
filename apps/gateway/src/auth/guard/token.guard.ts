import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";

export class TokenGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        if (!request.user) {
            throw new UnauthorizedException('토큰이 없거나 유효하지 않습니다');
        }

        return true;
    }
}