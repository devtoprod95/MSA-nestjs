import { Controller, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ParseBearerTokenDto } from './dto/parse-bearer-token.dto';
import { RpcInterceptor } from '@app/common/interceptor/rpc.interceptor';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({
    cmd: 'parse_bearer_token'
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  parseBearerToken(@Payload() payload: ParseBearerTokenDto){
    return this.authService.parseBearerToken(payload.token, false);
  }

  @MessagePattern({
    cmd: 'register'
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  registerUser(@Payload() registerDto: RegisterDto){
    return this.authService.register(registerDto);
  }

  @MessagePattern({
    cmd: 'login'
  })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  loginUser(@Payload() loginDto: LoginDto){
    return this.authService.login(loginDto);
  }
}
