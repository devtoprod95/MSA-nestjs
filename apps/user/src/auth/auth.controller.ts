import { Controller, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GrpcInterceptor, UserMicroservice } from '@app/common';
import { LoggingInterceptor } from '@app/common/interceptor/logging.interceptor';
import { Metadata } from '@grpc/grpc-js';

@Controller('auth')
@UseInterceptors(LoggingInterceptor)
@UseInterceptors(GrpcInterceptor)
@UserMicroservice.AuthServiceControllerMethods()
export class AuthController implements UserMicroservice.AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  parseBearerToken(request: UserMicroservice.ParseBearerTokenRequest){
    return this.authService.parseBearerToken(request.token, false);
  }

  registerUser(request: UserMicroservice.RegisterUserRequest){
    const { token } = request;
    if( token === null ){
      throw new UnauthorizedException('토큰을 입력해주세요.');
    }

    return this.authService.register(request);
  }

  loginUser(request: UserMicroservice.LoginUserRequest, metadata: Metadata){
    const { token } = request;
    if( token === null ){
      throw new UnauthorizedException('토큰을 입력해주세요.');
    }
    
    return this.authService.login(request);
  }
}
