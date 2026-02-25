import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserMicroservice } from '@app/common';

@Controller('auth')
export class AuthController implements UserMicroservice.AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  parseBearerToken(payload: UserMicroservice.ParseBearerTokenRequest){
    return this.authService.parseBearerToken(payload.token, false);
  }

  registerUser(registerDto: UserMicroservice.RegisterUserRequest){
    return this.authService.register(registerDto);
  }

  loginUser(loginDto: UserMicroservice.LoginUserRequest){
    return this.authService.login(loginDto);
  }
}
