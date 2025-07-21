import { Controller, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { DeliveryStartedDto } from './dto/delivery-started.dto';
import { OrderStatus } from './entity/order.entity';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({cmd: 'create_order'})
  @UseInterceptors(RpcInterceptor)
  async createOrder(@Payload() dto: CreateOrderDto){
    return await this.orderService.createOrder(dto);
  }

  @EventPattern({cmd: 'delivery_started'})
  @UseInterceptors(RpcInterceptor)
  async deliveryStarted(@Payload() payload: DeliveryStartedDto){
    return await this.orderService.changeOrderStatus(payload.id, OrderStatus.deliveryStarted);
  }

}
