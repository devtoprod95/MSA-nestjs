import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientGrpc } from '@nestjs/microservices';
import { ORDER_SERVICE, OrderMicroservice, UserPayloadDto } from '@app/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrderService implements OnModuleInit {
    orderService: OrderMicroservice.OrderServiceClient;
    constructor(
        @Inject(ORDER_SERVICE)
        private readonly orderMicroService: ClientGrpc,
    ){}

    onModuleInit() {
        this.orderService = this.orderMicroService.getService<OrderMicroservice.OrderServiceClient>('OrderService');
    }


    async createOrder(createOrderDto: CreateOrderDto, userPayload: UserPayloadDto){
        return await lastValueFrom(this.orderService.createOrder({
            ...createOrderDto,
            meta: {
                user: userPayload,
            }
        }));
    }
}
