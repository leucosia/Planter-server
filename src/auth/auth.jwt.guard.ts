import { ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenExpiredError } from "jsonwebtoken";
import { Observable } from "rxjs";

@Injectable()
export class AuthJWTGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext) {
        const result = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();

        if (!request.headers.authorization) {
            throw new UnauthorizedException("MISSING_TOKEN")
        }

        return result;
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
        if (err || !user) {
            throw new UnauthorizedException("EXPIRED_TOKEN")
        }
        return user;
    }
}