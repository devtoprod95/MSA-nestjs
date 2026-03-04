import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMicroservice } from '@app/common';
import { PaymentMethod } from './entity/payment.entity';

@Controller()
export class PaymentController implements PaymentMicroservice.PaymentServiceController {
  constructor(private readonly paymentService: PaymentService) {}

  makePayment(payload: PaymentMicroservice.MakePaymentRequest){
    return this.paymentService.makePayment({
      ...payload,
      paymentMethod: payload.paymentMethod as PaymentMethod
    });
  }
}
