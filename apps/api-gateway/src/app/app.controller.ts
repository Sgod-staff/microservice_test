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
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

interface User {
  _id: string;
  username: string;
  password: string;
}

interface UserList {
  users: User[];
}
interface UserService {
  GetUsersByProductId(data: { id: string }): Observable<any>;

  CreateUser(data: CreateUserDto): Observable<any>;
  FindAllUsers({}): Observable<any>;
  FindOneUser(data: { id: string }): Observable<any>;
  UpdateUser(data: { id: string; user: any }): Observable<any>;
  DeleteUser(data: { id: string }): Observable<any>;
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
  private userService: UserService;
  private productService: ProductService;
  constructor(
    @Inject('USER_PACKAGE') private userClient: ClientGrpc,
    @Inject('PRODUCT_PACKAGE') private productClient: ClientGrpc,
    private readonly appService: AppService
  ) {}

  onModuleInit() {
    this.userService = this.userClient.getService<UserService>('UserService');
    this.productService =
      this.productClient.getService<ProductService>('ProductService');
  }

  @Get('user/grpc/:id')
  getUserProducts(@Param('id') id: string): Observable<any> {
    return this.productService.GetProductsByUserId({ id });
  }

  @Get('product/grpc/:id')
  getProductUser(@Param('id') id: string): Observable<any> {
    return this.userService.GetUsersByProductId({ id });
  }

  @Get('user')
  async getAllUser() {
    return await this.userService.FindAllUsers({});
  }

  @Get('product')
  async getAllProduct() {
    const resdata = await this.productService.FindAllProducts({}).toPromise();
    return resdata;
  }
  @Get('user/:id')
  getOneUser(@Param('id') id: string): Observable<any> {
    console.log(id, 'getid here');

    return this.userService.FindOneUser({ id });
  }
  @Get('product/:id')
  getOneProduct(@Param('id') id: string): Observable<any> {
    console.log(id, 'getid here');
    return this.productService.FindOneProduct({ id });
  }
  @Post('user')
  createUser(@Body() createUserDto: any): Observable<any> {
    return this.userService.CreateUser(createUserDto);
  }
  @Post('product')
  createProduct(@Body() createProductDto: any): Observable<any> {
    console.log(createProductDto);
    return this.productService.CreateProduct(createProductDto);
  }

  @Put('user/:id')
  UpdateUser(@Param('id') id: string, @Body() user: any): Observable<any> {
    return this.userService.UpdateUser({ id, user });
  }
  @Put('product/:id')
  UpdateProduct(@Param('id') id: string, @Body() user: any): Observable<any> {
    return this.productService.UpdateProduct({ id, user });
  }
  @Delete('user/:id')
  deleteUser(@Param('id') id: string): Observable<any> {
    return this.userService.FindOneUser({ id });
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
}
