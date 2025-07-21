import { PRODUCT_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProductService {
    constructor(
        @Inject(PRODUCT_SERVICE)
        private readonly productMicroService: ClientProxy,
    ){}

    async createSamples(){
        return lastValueFrom(this.productMicroService.send({ cmd: 'create_samples'}, {}));
    }
}
