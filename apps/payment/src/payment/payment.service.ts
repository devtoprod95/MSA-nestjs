import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entity/payment.entity';
import { Repository } from 'typeorm';
import { MakePaymentDto } from './dto/make-payment.dto';
import { NOTIFICATION_SERVICE, NotificationMicroservice } from '@app/common';
import { lastValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class PaymentService implements OnModuleInit {
  notificationService: NotificationMicroservice.NotificationServiceClient;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationMicroService: ClientGrpc,
  ){}

  onModuleInit() {
    this.notificationService = this.notificationMicroService.getService<NotificationMicroservice.NotificationServiceClient>(
      'NotificationService',
    );
  }

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
        await this.updatePaymentStatus(paymentId, PaymentStatus.rejected);
      }

      throw error;
    }
  }

  async processPayment(){
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
    const resp = await lastValueFrom(this.notificationService.sendPaymentNotification({
      to: userEmail,
      orderId
    }));
  }
}
