import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'SCHEMA_REGISTRY',
      useFactory: () => {
        return new SchemaRegistry({
          host: 'http://localhost:8081', // Địa chỉ Schema Registry
        });
      },
    },
  ],
  exports: [UserService],
})
export class UserModule {}
