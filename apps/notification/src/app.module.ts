import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as Joi from 'joi';
import { NotificationModule } from "./notification/notification.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ORDER_SERVICE } from "@app/common";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URL: Joi.string().required(),
      })
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync({
      clients: [
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
    NotificationModule,
  ],
})
export class AppModule {}