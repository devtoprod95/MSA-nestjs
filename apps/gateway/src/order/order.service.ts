import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientGrpc } from '@nestjs/microservices';
import { constructMetadata, ORDER_SERVICE, OrderMicroservice, UserPayloadDto } from '@app/common';

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
        return this.orderService.createOrder({
            ...createOrderDto,
            meta: {
                user: userPayload,
            }
        }, constructMetadata(OrderService.name, 'createOrder'));
    }
}
