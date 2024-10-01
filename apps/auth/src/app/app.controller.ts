import { Controller, Get, Inject } from '@nestjs/common';

import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller()
export class AppController {
  private readonly userService: UserService;
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }
  @MessagePattern('auth')
  auth(data: any) {
    console.log('hello kafka', data);
  }
}
