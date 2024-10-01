import {
  Controller,
  Get,
  Param,
  Inject,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { ClientGrpc, ClientKafka } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { ApiBody, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

interface User {
  _id: string;
  username: string;
  password: string;
}

interface UserList {
  users: User[];
}

interface ProductService {
  GetProductsByUserId(data: { id: string }): Observable<any>;

  CreateProduct(data: any): Observable<any>;
  FindAllProducts({}): Observable<UserList>;
  FindOneProduct(data: { id: string }): Observable<any>;
  UpdateProduct(data: { id: string; user: any }): Observable<any>;
  DeleteProcduct(data: { id: string }): Observable<any>;
}

@Controller('gateway')
export class AppController {
  private productService: ProductService;
  constructor(
    @Inject('PRODUCT_PACKAGE') private productClient: ClientGrpc,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
    @Inject('PRODUCT_SERVICE') private readonly productKafka: ClientKafka,
    private readonly appService: AppService
  ) {}

  async onModuleInit() {
    this.productService =
      this.productClient.getService<ProductService>('ProductService');
    this.authClient.subscribeToResponseOf('get-one-user');
    this.authClient.subscribeToResponseOf('get-all-user');
    this.authClient.subscribeToResponseOf('create-user');
    await this.authClient.connect();
    this.productKafka.subscribeToResponseOf('get-all-product');
    this.productKafka.subscribeToResponseOf('create-product');
    this.productKafka.subscribeToResponseOf('get-one-product');
    this.productKafka.subscribeToResponseOf('update-product');
    this.productKafka.subscribeToResponseOf('delete-product');
    await this.productKafka.connect();
  }

  @ApiTags('Product-Grpc')
  @Get('product')
  async getAllProduct() {
    const resdata = await this.productService.FindAllProducts({});
    return resdata;
  }

  @ApiTags('Product-Grpc')
  @Get('product/:id')
  getOneProduct(@Param('id') id: string): Observable<any> {
    console.log(id, 'getid here');
    return this.productService.FindOneProduct({ id });
  }

  @ApiTags('Product-Grpc')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'sữa gấu' },
        price: { type: 'string', example: '12000' },
      },
    },
  })
  @ApiTags('Product-Grpc')
  @Post('product')
  createProduct(@Body() createProductDto: any): Observable<any> {
    console.log(createProductDto);
    return this.productService.CreateProduct(createProductDto);
  }

  @ApiTags('Product-Grpc')
  @Put('product/:id')
  UpdateProduct(@Param('id') id: string, @Body() user: any): Observable<any> {
    return this.productService.UpdateProduct({ id, user });
  }

  @ApiTags('Product-Grpc')
  @Delete('product/:id')
  deleteProduct(@Param('id') id: string): Observable<any> {
    return this.productService.FindOneProduct({ id });
  }

  //***************************KAFKA handle********************************** */
  @ApiTags('Product-Kafka')
  @Get('product/kafka/get-all')
  async getAllProductKafka(): Promise<object> {
    const res = await this.appService.getAllProductKafka();
    return res;
  }

  @ApiTags('Product-Kafka')
  @Post('product/kafka/create')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'string' },
      },
    },
  })
  async createProductKafka(@Body() createDto: any) {
    const res = await this.appService.createProductKafka(createDto);
    return res;
  }
  @ApiTags('Product-Kafka')
  @Get('product/kafka/:id')
  getOneProductKafka(@Param('id') id: string) {
    return this.appService.getOneProductKafka(id);
  }
  @ApiTags('Product-Kafka')
  @Put('product/kafka/update/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'string' },
      },
    },
  })
  async updateProductKafka(@Param('id') id: string, @Body() createDto: any) {
    const res = await this.appService.updateProductKafka(id, createDto);
    return res;
  }

  @ApiTags('Product-Kafka')
  @Delete('product/kafka/delete/:id')
  async deleteProductKafka(@Param('id') id: string) {
    const res = await this.appService.deleteProductKafka(id);
    return res;
  }

  // Đăng nhập user
  @ApiTags('Login')
  @Post('auth/login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  loginUser(@Body() loginDto: any) {
    console.log(loginDto);
    return this.appService.sendMessage(loginDto);
  }
  @ApiTags('User')
  @Post('user/create')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async createUser(@Body() createDto: any) {
    return await this.appService.createUser(createDto);
  }

  @ApiTags('User')
  @Get('user/get-one/:id')
  async getOne(@Param('id') id: string): Promise<object> {
    const res = await this.appService.getOne(id);
    return res;
  }
  @ApiTags('User')
  @Get('user/get-all')
  async getAll(): Promise<object> {
    const res = await this.appService.getAllUser();
    return res;
  }
}
