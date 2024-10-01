import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @GrpcMethod('ProductService', 'CreateProduct')
  create(createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @GrpcMethod('ProductService', 'FindAllProducts')
  async findAllProduct(): Promise<{ products: any[] }> {
    const products = await this.productService.findAll();
    return { products };
  }

  @GrpcMethod('ProductService', 'FindOneProduct')
  findOne(data: { id: string }) {
    console.log(data);
    const { id } = data;
    return this.productService.findOne(id);
  }

  @GrpcMethod('ProductService', 'UpdateProduct')
  update(id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }
  @GrpcMethod('ProductService', 'DeleteProduct')
  delte(data: { id: string }) {
    const { id } = data;
    return this.productService.delete(id);
  }
}
