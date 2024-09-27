import { Controller, Get, Inject } from '@nestjs/common';

import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
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
