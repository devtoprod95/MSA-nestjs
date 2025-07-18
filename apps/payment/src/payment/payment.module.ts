import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Payment } from './entity/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment
    ])
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
