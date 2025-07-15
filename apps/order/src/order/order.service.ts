import { Inject,Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PRODUCT_SERVICE, USER_SERVICE } from '@app/common';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';
import { Product } from './entity/product.entity';
import { Customer } from './entity/customer.entity';
import { AddressDto } from './dto/address.dto';
import { PaymentDto } from './dto/payment.dto';
import { Model } from 'mongoose';
import { Order } from './entity/order.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class OrderService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userSerivce: ClientProxy,
    @Inject(PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
    @InjectModel(Order.name)
    private readonly orderRepository: Model<Order>,
  ){

  }


  async createOrder(token: string, dto: CreateOrderDto) {
    const {productIds, address, payment } = dto;

    // 1) 사용자 정보 가져오기
    const user = await this.getUserFromToken(token);

    // 2) 상품 정보 가져오기
    const products = await this.getProductsByIds(productIds); 

    // 3) 총 금액 계산하기
    const totalAmount = this.calculateTotalAmount(products);

    // 4) 금액 검증하기 - total이 맞는지 (프론트에서 보내준 데이터 비교)
    this.validatePaymentAmount(totalAmount, payment.amount);

    // 5) 주문 생성하기 - 데이터베이스에 넣기
    const customer = this.createCustomer(user);
    const order = await this.createNewOrder(customer, products, address, payment);

    // 6) 결제 시도하기
    // 7) 주문 상태 업데이트하기
    // 8) 결과 반환하기
  }

  private async getUserFromToken(token: string){
    // 1) User MS : JWT 토큰 검증
    const tResp = await lastValueFrom(this.userSerivce.send({cmd: 'parse_bearer_token'}, {token}));

    if( tResp.status === 'error' ){
      throw new PaymentCancelledException(tResp);
    }

    // 2) User MS : 사용자 정보 가져오기
    const userId = tResp.data.sub;
    const uResp = await lastValueFrom(this.userSerivce.send({cmd: 'get_user_info'}, {userId}));
    if( uResp.status === 'error' ){
      throw new PaymentCancelledException(uResp);
    }

    return uResp.data;
  }

  private async getProductsByIds(productIds: string[]): Promise<Product[]>{
    const resp = await lastValueFrom(this.productService.send({cmd: 'get_products_info'}, {productIds}));

    if( resp.status === 'error' ){
      throw new PaymentCancelledException('상품 정보가 잘못되었습니다.');
    }

    // [Product, Product] => product.price + product.price 가 동일한지 체크
    return resp.data.map((product) => ({
      productId: product.id,
      name     : product.name,
      price    : product.price,
    }));
  }

  private calculateTotalAmount(products: Product[]): number{
    return products.reduce((acc, next) => acc + next.price, 0);
  }

  private validatePaymentAmount(totalA: number, totalB: number): void{
    if(totalA !== totalB){
      throw new PaymentCancelledException('결제하려는 금액이 변경되었습니다.');
    }
  }

  private createCustomer(user: {id: string, email: string, name: string}): Customer{
    return {
      userId: user.id,
      email: user.email,
      name: user.name
    }
  }

  private createNewOrder(customer: Customer, products: Product[], deliveryAddress: AddressDto, payment: PaymentDto){
    return this.orderRepository.create({
      customer,
      products,
      deliveryAddress,
      payment
    });
  }
}
