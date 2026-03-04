import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMicroservice } from '@app/common';
import { PaymentMethod } from './entity/payment.entity';

@Controller()
export class PaymentController implements PaymentMicroservice.PaymentServiceController {
  constructor(private readonly paymentService: PaymentService) {}

  makePayment(request: PaymentMicroservice.MakePaymentRequest){
    return this.paymentService.makePayment({
      ...request,
      paymentMethod: request.paymentMethod as PaymentMethod
    });
  }
}
