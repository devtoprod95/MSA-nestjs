import { Controller, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcInterceptor, UserMicroservice } from '@app/common';
import { LoggingInterceptor } from '@app/common/interceptor/logging.interceptor';

@Controller()
@UseInterceptors(GrpcInterceptor)
@UseInterceptors(LoggingInterceptor)
@UserMicroservice.UserServiceControllerMethods()
export class UserController implements UserMicroservice.UserServiceController {
  constructor(private readonly userService: UserService) {}

  getUserInfo(request: UserMicroservice.GetUserInfoRequest){
    return this.userService.getUserById(request.userId);
  }
}
