import { constructMetadata, PRODUCT_SERVICE, ProductMicroservice } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProductService implements OnModuleInit {
    productService: ProductMicroservice.ProductServiceClient;

    constructor(
        @Inject(PRODUCT_SERVICE)
        private readonly productMicroService: ClientGrpc,
    ){}

    onModuleInit() {
        this.productService = this.productMicroService.getService<ProductMicroservice.ProductServiceClient>('ProductService');
    }

    async createSamples(){
        return lastValueFrom(this.productService.createSamples({}, constructMetadata(ProductService.name, 'createSamples')));
    }
}
