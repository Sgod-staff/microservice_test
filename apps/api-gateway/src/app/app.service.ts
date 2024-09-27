import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka
  ) {}

  async sendMessage(loginDto: any) {
    console.log('api gatwway emit');
    await this.authClient.emit('auth', loginDto);
  }
}
