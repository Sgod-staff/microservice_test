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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

@Controller('user')
export class UserController {
  constructor(
    @Inject('SCHEMA_REGISTRY') private readonly schemaRegistry: SchemaRegistry,
    private readonly userService: UserService
  ) {}

  @MessagePattern('create-user')
  async createUser(@Payload() message: any) {
    console.log('Received message:', message);
    const decodedMessage = await this.schemaRegistry.decode(message);
    console.log('Decoded message:', decodedMessage);
    const createUserDto: CreateUserDto = decodedMessage as CreateUserDto;
    const res = await this.userService.create(createUserDto);
    return res;
  }

  @MessagePattern('get-all-user')
  async getAllUser() {
    const res = await this.userService.findAll();
    return res;
  }
  @MessagePattern('get-one-user')
  async getOneUser(id: string) {
    const res = await this.userService.findOne(id);
    return res;
  }
  @MessagePattern('update-user')
  async updateUser(id: string, data: any) {
    await this.userService.update(id, data);
  }
  @MessagePattern('delete-user')
  async deleteuser(data: any) {
    await this.userService.delete(data);
  }
}
