import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { USER_SERVICE, PRODUCT_SERVICE, PAYMENT_SERVICE, ORDER_SERVICE } from "@app/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import * as Joi from 'joi';
import { BearerTokenMiddleware } from "./auth/middleware/bearer-token.middleware";

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
                        transport: Transport.REDIS,
                        options: {
                            host: 'redis',
                            port: 6379,
                        }
                    }),
                    inject: [ConfigService]
                },
                {
                    name: PRODUCT_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.REDIS,
                        options: {
                            host: 'redis',
                            port: 6379,
                        }
                    }),
                    inject: [ConfigService]
                },
                {
                    name: ORDER_SERVICE,
                    useFactory: (configService: ConfigService) => ({
                        transport: Transport.REDIS,
                        options: {
                            host: 'redis',
                            port: 6379,
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