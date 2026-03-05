import { Controller, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { GrpcInterceptor, ProductMicroservice } from '@app/common';

@Controller('product')
@UseInterceptors(GrpcInterceptor)
@ProductMicroservice.ProductServiceControllerMethods()
export class ProductController implements ProductMicroservice.ProductServiceController {
  constructor(private readonly productService: ProductService) {}

  async createSamples(){
    const resp = await this.productService.createSamples();
    
    return {
      success: resp
    }
  }

  async getProductInfo(request: ProductMicroservice.GetProductInfoRequest){
    const resp = await this.productService.getProductsInfo(request.productIds);

    return {
      products: resp
    }
  }

}
