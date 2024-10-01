import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
async function bootstrapKafka() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'product',
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'product-consumer',
        },
      },
    }
  );

  await app.listen();
  Logger.log(`🚀 Kafka Microservice Product is running`);
}
async function bootstrapGRPC() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'product',
        protoPath: join(__dirname, '../../../apps/product/proto/product.proto'),
        url: 'localhost:' + process.env.PORT_GRPC,
      },
    }
  );

  await app.listen();
  Logger.log(
    `🚀 gRPC Microservice Product is running on: http://localhost:${process.env.PORT_GRPC}`
  );
}

async function bootstrap() {
  await Promise.all([bootstrapGRPC(), bootstrapKafka()]);
}

bootstrap();
