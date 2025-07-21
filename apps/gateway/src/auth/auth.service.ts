import { USER_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @Inject(USER_SERVICE)
        private readonly userMicroService: ClientProxy,
    ){}

    async register(token: string, registerDto: RegisterDto){
        return await lastValueFrom(this.userMicroService.send({ cmd: 'register'}, {
                ...registerDto,
                token,
            }));

    }

    async login(token: string){
        const result = await lastValueFrom(this.userMicroService.send({ cmd: 'login'}, {
            token,
        }));

        return result?.data;
    }
}
