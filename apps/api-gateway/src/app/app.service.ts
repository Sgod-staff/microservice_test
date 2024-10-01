import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import type { RawAvroSchema } from '@kafkajs/confluent-schema-registry/dist/@types';

@Injectable()
export class AppService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
    @Inject('SCHEMA_REGISTRY') private readonly schemaRegistry: SchemaRegistry
  ) {}
  async createUser(userDto: any) {
    console.log(userDto);
    const schema: RawAvroSchema = {
      type: 'record',
      name: 'User',
      namespace: 'com.example',
      fields: [
        { name: 'username', type: 'string' },
        { name: 'password', type: 'string' },
      ],
    };
    const { id } = await this.schemaRegistry.register(schema);
    console.log(id, 'id sevice');
    const avroMessage = await this.schemaRegistry.encode(id, userDto);
    console.log(avroMessage);
    const res = await this.authClient.send('create-user', avroMessage);
    return res;
  }

  async sendMessage(loginDto: any) {
    console.log('api gatwway emit');
    return this.authClient.emit('auth', loginDto);
  }

  // async createUser(createDto: any) {
  //   return await this.authClient.send('create-user', createDto);
  // }
  async getOne(id: any) {
    return await this.authClient.send('get-one-user', id);
  }

  async getAllUser() {
    return await this.authClient.send('get-all-user', {});
  }
}
