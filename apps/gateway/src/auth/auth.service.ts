import { USER_SERVICE, UserMicroservice } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
    userService: UserMicroservice.AuthServiceClient;

    constructor(
        @Inject(USER_SERVICE)
        private readonly userMicroService: ClientGrpc,
    ){}

    onModuleInit() {
        this.userService = this.userMicroService.getService<UserMicroservice.AuthServiceClient>('AuthService');
    }

    register(token: string, registerDto: RegisterDto){
        return lastValueFrom(this.userService.registerUser({
            ...registerDto,
            token,
        }));
    }

    login(token: string){
        return lastValueFrom(this.userService.loginUser({
            token,
        }));
    }
}
