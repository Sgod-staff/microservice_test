import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface ProductService {
  GetProductsByUserId(data: { id: number }): Observable<{ products: any[] }>;
}
@Injectable()
export class UserService {
  private productService: ProductService;
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject('PRODUCT_PACKAGE') private client: ClientGrpc
  ) {}
  onModuleInit() {
    this.productService =
      this.client.getService<ProductService>('ProductService');
  }
  async create(createUserDto: CreateUserDto) {
    return await this.userModel.create(createUserDto);
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne(id: string) {
    return await this.userModel.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(id, updateUserDto);
  }
  async delete(id: string) {
    return await this.userModel.findByIdAndDelete(id);
  }
  async getUserAndProduct(userId: string) {
    const user = await this.userModel.findById(userId);

    const { products } = await this.productService
      .GetProductsByUserId({ id: 123 })
      .toPromise(); // Chuyển Observable thành Promise
    return {
      user,
      products,
    };
  }
}
