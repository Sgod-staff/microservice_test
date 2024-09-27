import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './entities/product.entity';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';

interface UserService {
  GetUsersByProductId(data: { id: number }): Observable<{ users: any[] }>;
}
@Injectable()
export class ProductService {
  private userService: UserService;
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @Inject('USER_PACKAGE') private client: ClientGrpc
  ) {}

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  async create(createProductDto: CreateProductDto) {
    return await this.productModel.create(createProductDto);
  }

  async findAll() {
    return await this.productModel.find();
  }

  async findOne(id: string) {
    return await this.productModel.findById(id);
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    return await this.productModel.findByIdAndUpdate(id, updateProductDto);
  }
  async delete(id: string) {
    return await this.productModel.findByIdAndDelete(id);
  }
  async getProductAndUsers(productId: number, userId: number) {
    const product = await this.productModel.findById(productId);
    const { users } = await this.userService
      .GetUsersByProductId({ id: userId })
      .toPromise(); // Chuyển Observable thành Promise
    return {
      product,
      users,
    };
  }
}
