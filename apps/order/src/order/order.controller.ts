import { Controller, ValidationPipe, Post, Body, UsePipes, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { DeliveryStartedDto } from './dto/delivery-started.dto';
import { OrderStatus } from './entity/order.entity';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // @Post()
  // @UsePipes(ValidationPipe)
  // async createOrder(@Authorization() token: string, @Body() dto: CreateOrderDto){
  //   return this.orderService.createOrder(token, dto);
  // }

  @EventPattern({cmd: 'delivery_started'})
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  async deliveryStarted(@Payload() payload: DeliveryStartedDto){
    await this.orderService.changeOrderStatus(payload.id, OrderStatus.deliveryStarted);
  }

}
