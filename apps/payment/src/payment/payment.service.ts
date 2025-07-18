import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { MakePaymentDto } from './dto/make-payment.dto';
import { NOTIFICATION_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationService: ClientProxy,
  ){}

  async makePayment(payload: MakePaymentDto){
    let paymentId;

    try {
      
      const result = await this.paymentRepository.save(payload);
      paymentId = result.id;

      await this.processPayment();

      await this.updatePaymentStatus(paymentId, PaymentStatus.approved);

      // notification 보내기
      this.sendNotification(payload.orderId, payload.userEmail);

      return await this.paymentRepository.findOneBy({id: paymentId});
    } catch (error) {
      if( paymentId ){
        await this.updatePaymentStatus(paymentId, PaymentStatus.approved);
      }
    }
  }

  async processPayment(){
    await new Promise((resoleve) => setTimeout(resoleve, 1000));
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus){
    await this.paymentRepository.update(
      {
        id
      },
      {
        paymentStatus: paymentStatus
      }
    );
  }

  async sendNotification(orderId: string, userEmail: string){
    const resp = await this.notificationService.send({ cmd: 'send_payment_notification' }, {
      to: userEmail,
      orderId
    });
  }
}
