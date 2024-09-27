import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async create(createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @GrpcMethod('UserService', 'FindAllUsers')
  async findAllUsers(): Promise<{ users: any[] }> {
    const users = await this.userService.findAll();
    console.log(users);
    return { users };
  }

  @GrpcMethod('UserService', 'FindOneUser')
  findOne(data: { id: string }) {
    const { id } = data;
    console.log(id, 'getid here');
    return this.userService.findOne(id);
  }

  @GrpcMethod('UserService', 'UpdateUser')
  // @Patch(':id')
  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @GrpcMethod('UserService', 'GetDatabyUserId')
  async getUserAndProduct(userId: string) {
    return this.userService.getUserAndProduct(userId);
  }

  @GrpcMethod('UserService', 'DeleteUser')
  delte(data: { id: string }) {
    const { id } = data;
    return this.userService.delete(id);
  }

  @GrpcMethod('UserService', 'GetUsersByProductId')
  async getUserGrpc(data: { id: number }): Promise<{ users: any[] }> {
    const users = await this.userService.findAll();
    return { users };
  }
}
