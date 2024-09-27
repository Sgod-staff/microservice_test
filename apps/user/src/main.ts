import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(__dirname, '../../../apps/user/proto/user.proto'),
        url: 'localhost:' + process.env.PORT_GRPC,
      },
    }
  );
  // const port = process.env.PORT || 3000;
  // const httpApp = await NestFactory.create(AppModule);
  // const globalPrefix = 'api';
  // httpApp.setGlobalPrefix(globalPrefix);
  // await httpApp.listen(port);
  await app.listen();

  // Logger.log(
  //   `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  // );
  Logger.log(
    `🚀 gRPC Microservice User is running on: http://localhost:${process.env.PORT_GRPC}`
  );
}

bootstrap();
