import { Module, OnModuleInit } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'product',
          protoPath: join(
            __dirname,
            '../../../apps/api-gateway/proto/product.proto'
          ),
          url: 'localhost:4001', // Port của Product microservice
        },
      },
      {
        name: 'AUTH_SERVICE', // tên của gói kafka để sử dụng trong sercvice, controller
        transport: Transport.KAFKA, // phương thức  giao tiếp của microservice
        options: {
          client: {
            clientId: 'auth', //  tên
            brokers: ['localhost:9092'], // port hoạt động của kafka broker
          },
          consumer: {
            groupId: 'auth-consumer',
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'SCHEMA_REGISTRY',
      useFactory: () => {
        return new SchemaRegistry({
          host: 'http://localhost:8081',
        });
      },
    },
  ],
})
export class AppModule {}
