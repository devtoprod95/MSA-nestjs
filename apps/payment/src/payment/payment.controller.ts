import { Controller, UseInterceptors } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GrpcInterceptor, PaymentMicroservice } from '@app/common';
import { PaymentMethod } from './entity/payment.entity';
import { Metadata } from '@grpc/grpc-js';

@Controller()
@UseInterceptors(GrpcInterceptor)
@PaymentMicroservice.PaymentServiceControllerMethods()
export class PaymentController implements PaymentMicroservice.PaymentServiceController {
  constructor(private readonly paymentService: PaymentService) {}

  makePayment(request: PaymentMicroservice.MakePaymentRequest, metadata: Metadata){
    return this.paymentService.makePayment({
      ...request,
      paymentMethod: request.paymentMethod as PaymentMethod
    }, metadata);
  }
}
