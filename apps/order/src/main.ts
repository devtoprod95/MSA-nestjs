import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order/order.module';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.HTTP_PORT ?? 3000);
}
bootstrap();
