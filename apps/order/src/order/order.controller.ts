import { Controller, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderMicroservice } from '@app/common';
import { OrderStatus } from './entity/order.entity';
import { PaymentMethod } from './entity/payment.entity';
import { LoggingInterceptor } from '@app/common/interceptor/logging.interceptor';

@Controller('order')
@UseInterceptors(LoggingInterceptor)
@OrderMicroservice.OrderServiceControllerMethods()
export class OrderController implements OrderMicroservice.OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  async deliveryStarted(request: OrderMicroservice.DeliveryStartedRequest){
    return await this.orderService.changeOrderStatus(request.id, OrderStatus.deliveryStarted);
  }
  
  async createOrder(request: OrderMicroservice.CreateOrderRequest){
    return await this.orderService.createOrder({
      ...request,
      payment: {
        ...request.payment,
        paymentMethod: request.payment.paymentMethod as PaymentMethod
      }
    });
  }
}
