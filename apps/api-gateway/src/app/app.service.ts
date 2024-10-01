import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import type { RawAvroSchema } from '@kafkajs/confluent-schema-registry/dist/@types';
import {
  createProductSchema,
  getProductSchema,
  registerSchema,
  schemaRegistry,
  updateProductSchema,
} from './app.schema.registry';

@Injectable()
export class AppService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
    @Inject('SCHEMA_REGISTRY') private readonly schemaRegistry: SchemaRegistry,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientKafka
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
    const res = this.authClient.send('create-user', avroMessage);
    return res;
  }

  async sendMessage(loginDto: any) {
    console.log('api gatwway emit');
    return this.authClient.emit('auth', loginDto);
  }
  async getOne(id: any) {
    return await this.authClient.send('get-one-user', id);
  }
  async getAllUser() {
    return await this.authClient.send('get-all-user', {});
  }
  // Serive  for GRPC  **********************s
  async getAllProductKafka() {
    return await this.productClient.send('get-all-product', {});
  }

  async createProductKafka(createProductDto: any) {
    console.log(createProductDto);
    const schemaId = await registerSchema(createProductSchema);
    console.log(schemaId, 'createProduct schema ID');
    const avroMessage = await schemaRegistry.encode(schemaId, createProductDto);
    console.log(avroMessage);
    const res = await this.productClient.send('create-product', avroMessage);
    return res;
  }

  async getOneProductKafka(idReq: string) {
    console.log('idReq:', idReq);
    const schemaId = await registerSchema(getProductSchema);
    console.log(schemaId, 'getProduct schema ID');
    const avroMessage = await schemaRegistry.encode(schemaId, { id: idReq });
    console.log(avroMessage);
    const res = await this.productClient.send('get-one-product', avroMessage);
    return res;
  }
  async updateProductKafka(id: string, updateProductDto: any) {
    console.log('Updating product:', id, updateProductDto);
    const schemaId = await registerSchema(updateProductSchema);
    console.log(schemaId, 'updateProduct schema ID');
    const avroMessage = await schemaRegistry.encode(schemaId, {
      id: id,
      ...updateProductDto,
    });
    console.log(avroMessage);
    const res = await this.productClient.send('update-product', avroMessage);
    return res;
  }
  async deleteProductKafka(idReq: string) {
    console.log('idReq:', idReq);
    const schemaId = await registerSchema(getProductSchema);
    console.log(schemaId, 'delete schema ID');
    const avroMessage = await schemaRegistry.encode(schemaId, { id: idReq });
    console.log(avroMessage);
    const res = await this.productClient.send('delete-product', avroMessage);
    return res;
  }
}
