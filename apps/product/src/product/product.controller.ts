import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductMicroservice } from '@app/common';

@Controller('product')
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
