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
import { ApiBody, ApiTags } from '@nestjs/swagger';
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
    private readonly appService: AppService
  ) {}

  async onModuleInit() {
    this.productService =
      this.productClient.getService<ProductService>('ProductService');
    this.authClient.subscribeToResponseOf('get-one-user');
    this.authClient.subscribeToResponseOf('get-all-user');
    this.authClient.subscribeToResponseOf('create-user');
    await this.authClient.connect();
  }

  @Get('user/grpc/:id')
  getUserProducts(@Param('id') id: string): Observable<any> {
    return this.productService.GetProductsByUserId({ id });
  }

  @Get('product')
  async getAllProduct() {
    const resdata = await this.productService.FindAllProducts({}).toPromise();
    return resdata;
  }

  @Get('product/:id')
  getOneProduct(@Param('id') id: string): Observable<any> {
    console.log(id, 'getid here');
    return this.productService.FindOneProduct({ id });
  }

  @Post('product')
  createProduct(@Body() createProductDto: any): Observable<any> {
    console.log(createProductDto);
    return this.productService.CreateProduct(createProductDto);
  }

  @Put('product/:id')
  UpdateProduct(@Param('id') id: string, @Body() user: any): Observable<any> {
    return this.productService.UpdateProduct({ id, user });
  }

  @Delete('product/:id')
  deleteProduct(@Param('id') id: string): Observable<any> {
    return this.productService.FindOneProduct({ id });
  }

  //***************************KAFKA handle********************************** */

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
