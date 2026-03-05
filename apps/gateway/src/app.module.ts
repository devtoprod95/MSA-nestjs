import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { USER_SERVICE, PRODUCT_SERVICE, ORDER_SERVICE, UserMicroservice, ProductMicroservice, OrderMicroservice, traceInterceptor } from "@app/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import * as Joi from 'joi';
import { BearerTokenMiddleware } from "./auth/middleware/bearer-token.middleware";
import { join } from "path";

@Module({
    imports: [OrderModule, ProductModule, AuthModule,
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                HTTP_PORT: Joi.number().required(),
                USER_HOST: Joi.string().required(),
                USER_TCP_PORT: Joi.number().required(),
                PRODUCT_HOST: Joi.string().required(),
                PRODUCT_TCP_PORT: Joi.number().required(),
                ORDER_HOST: Joi.string().required(),
                ORDER_TCP_PORT: Joi.number().required(),
            })
        }), 
        ClientsModule.registerAsync({
            clients: [
                {
                    name: USER_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            channelOptions: {
                                interceptors: [traceInterceptor('Gateway')]
                            },
                            package: UserMicroservice.protobufPackage,
                            protoPath: join(process.cwd(), 'proto/user.proto'),
                            url: configService.getOrThrow('USER_GRPC_URL')
                        }
                    }),
                    inject: [ConfigService]
                },
                {
                    name: PRODUCT_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            channelOptions: {
                                interceptors: [traceInterceptor('Gateway')]
                            },
                            package: ProductMicroservice.protobufPackage,
                            protoPath: join(process.cwd(), 'proto/product.proto'),
                            url: configService.getOrThrow('PRODUCT_GRPC_URL')
                        }
                    }),
                    inject: [ConfigService]
                },
                {
                    name: ORDER_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.GRPC,
                        options: {
                            channelOptions: {
                                interceptors: [traceInterceptor('Gateway')]
                            },
                            package: OrderMicroservice.protobufPackage,
                            protoPath: join(process.cwd(), 'proto/order.proto'),
                            url: configService.getOrThrow('ORDER_GRPC_URL')
                        }
                    }),
                    inject: [ConfigService]
                }
            ],
            isGlobal: true
        }),
    ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BearerTokenMiddleware).forRoutes("order");
  }
}