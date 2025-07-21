import { Inject, Injectable } from '@nestjs/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationStatus } from './entity/notification.entity';
import { ORDER_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationRepository: Model<Notification>,
    @Inject(ORDER_SERVICE)
    private readonly orderSerivce: ClientProxy,
  ){}

  async sendPaymentNotification(dto: SendPaymentNotificationDto) {
    const notification = await this.createPaymentNotification(dto.to);

    await this.sendEmail();

    await this.updateNotificationStatus(notification._id.toString(), NotificationStatus.sent);

    this.sendDeliveryStartedMessage(dto.orderId);

    return this.notificationRepository.findById(notification._id);
  }

  sendDeliveryStartedMessage(orderId: string){
    this.orderSerivce.emit({ cmd: 'delivery_started'}, {id: orderId});
  }

  async updateNotificationStatus(id: string, status: NotificationStatus){
    return await this.notificationRepository.findByIdAndUpdate(id, {status})
  }

  async sendEmail(){
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async createPaymentNotification(to: string) {
    return await this.notificationRepository.create({
      from: 'devtoprod@gmail.com',
      to: to,
      subject: '배송이 시작되었습니다.',
      content: `${to}님, 주문하신 물건이 배송이 시작됐습니다.`
    })
  }
}
