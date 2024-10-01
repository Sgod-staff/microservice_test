import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GrpcMethod, MessagePattern, Payload } from '@nestjs/microservices';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

@Controller('product')
export class ProductController {
  constructor(
    @Inject('SCHEMA_REGISTRY') private readonly schemaRegistry: SchemaRegistry,
    private readonly productService: ProductService
  ) {}

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

  @MessagePattern('get-all-product')
  async findAllProductKafka(): Promise<{ products: any[] }> {
    const products = await this.productService.findAll();
    return { products };
  }

  @MessagePattern('create-product')
  async createProductKafka(@Payload() message: any) {
    console.log('Received message:', message);
    const decodedMessage = await this.schemaRegistry.decode(message);
    console.log('Decoded message:', decodedMessage);
    const createProductDto: CreateProductDto =
      decodedMessage as CreateProductDto;
    const res = await this.productService.create(createProductDto);
    console.log(res);
    return res;
  }

  @MessagePattern('get-one-product')
  async getOneProductKafka(@Payload() message: any) {
    const decodedMessage = await this.schemaRegistry.decode(message);
    const id = decodedMessage.id;
    const products = await this.productService.findOne(id);
    return products;
  }
  @MessagePattern('update-product')
  async updateProductKafka(@Payload() message: any) {
    const decodedMessage = await this.schemaRegistry.decode(message);
    const { id, name, price } = decodedMessage;
    const updateProductDto = {
      name,
      price,
    };
    const products = await this.productService.update(id, updateProductDto);
    return products;
  }
  @MessagePattern('delete-product')
  async deleteProductKafka(@Payload() message: any) {
    const decodedMessage = await this.schemaRegistry.decode(message);
    const id = decodedMessage.id;
    const products = await this.productService.delete(id);
    return products;
  }
}
