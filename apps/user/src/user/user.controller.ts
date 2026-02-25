import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { UserMicroservice } from '@app/common';

@Controller()
export class UserController implements UserMicroservice.UserServiceController {
  constructor(private readonly userService: UserService) {}

  getUserInfo(data: UserMicroservice.GetUserInfoRequest){
    return this.userService.getUserById(data.userId);
  }
}
