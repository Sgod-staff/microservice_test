import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
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
export class ProductModule {}
