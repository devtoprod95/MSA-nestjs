import { Controller, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserMicroservice } from '@app/common';
import { LoggingInterceptor } from '@app/common/interceptor/logging.interceptor';

@Controller('auth')
@UseInterceptors(LoggingInterceptor)
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

  loginUser(request: UserMicroservice.LoginUserRequest){
    const { token } = request;
    if( token === null ){
      throw new UnauthorizedException('토큰을 입력해주세요.');
    }
    
    return this.authService.login(request);
  }
}
