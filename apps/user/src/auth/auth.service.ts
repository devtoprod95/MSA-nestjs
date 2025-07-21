import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ){

    }

    async register(registerDto: RegisterDto){
        const {email, password} = this.parseBasicToken(registerDto.token);

        return this.userService.create({
            ...registerDto,
            email,
            password
        });
    }

    async login(loginDto: LoginDto){
        const rawToken = loginDto.token;

        const {email, password} = this.parseBasicToken(rawToken);

        const user = await this.authenticate(email, password);

        return {
            refreshToken: await this.issueToken(user, true),
            accessToken: await this.issueToken(user, false),
        }
    }

    async authenticate(email: string, password: string){
        const user = await this.userRepository.findOne({
            where: {
                email
            },
            select: {
                id: true,
                email: true,
                password: true
            }
        });

        if( !user ){
            throw new UnauthorizedException('잘못된 로그인 정보입니다.');
        }

        const passOk = await bcrypt.compare(password, user.password);
        if( !passOk ){
            throw new UnauthorizedException('비밀번호를 확인바랍니다.');
        }

        return user;
    }

    parseBasicToken(rawToken: string){
        const basicSplit = rawToken.split(' ');

        if( basicSplit.length !== 2 ){
            throw new BadRequestException('토큰 포맷이 잘못됐습니다.');
        }

        const [basic, token] = basicSplit;
        if( basic.toLocaleLowerCase() !== 'basic' ){
            throw new BadRequestException('basic 토큰 포맷이 잘못됐습니다.');
        }

        const decoded = Buffer.from(token, 'base64').toString('utf-8');

        const tokenSplit = decoded.split(':');
        if( tokenSplit.length !== 2 ){
            throw new BadRequestException('decoded 토큰 포맷이 잘못됐습니다.');
        }

        const [email, password] = tokenSplit;
        return { email, password };
    }

    async parseBearerToken(rawToken: string, isRefreshToken: boolean){
        const bearerSplit = rawToken.split(' ');

        if( bearerSplit.length !== 2 ){
            throw new RpcException('토큰 포맷이 잘못됐습니다.');
        }

        const [bearer, token] = bearerSplit;
        if( bearer.toLocaleLowerCase() !== 'bearer' ){
            throw new RpcException('bearer 토큰 포맷이 잘못됐습니다.');
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: this.configService.getOrThrow<string>(
                        isRefreshToken ? 'REFRESH_TOKEN_SECRET' : 'ACCESS_TOKEN_SECRET'
                    )
                }
            );

            if( isRefreshToken ){
                if(payload.type !== 'refresh'){
                    throw new RpcException('Refresh 토큰을 입력해주세요.');
                }
            } else {
                if(payload.type !== 'access'){
                    throw new RpcException('Access 토큰을 입력해주세요.');
                }
            }

            return payload;
        } catch (error) {
            console.log(error);
            throw new RpcException('토큰이 만료되었습니다.');
        }
    }

    async issueToken(user: any, isRefreshToken: boolean){
        const refreshTokenSecret = this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET');
        const accessTokenSecret  = this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET');

        return this.jwtService.signAsync({
            sub: user.id ?? user.sub,
            role: user.role,
            type: isRefreshToken ? 'refresh' : 'access'
        }, {
            secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
            expiresIn: '3600h'
        })
    }

}
