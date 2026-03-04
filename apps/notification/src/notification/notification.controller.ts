import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationMicroservice } from '@app/common';


@Controller()
export class NotificationController implements NotificationMicroservice.NotificationServiceController {
  constructor(private readonly notificationService: NotificationService) {}

  async sendPaymentNotification(payload: NotificationMicroservice.SendPaymentNotificationRequest){
    const resp = (await this.notificationService.sendPaymentNotification({
      ...payload,
      to: payload.id
    })).toJSON();

    return {
      ...resp,
      status: resp.status.toString()
    }
  }
}
