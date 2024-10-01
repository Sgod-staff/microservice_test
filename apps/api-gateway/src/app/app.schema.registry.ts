// schema.registry.ts
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import type { RawAvroSchema } from '@kafkajs/confluent-schema-registry/dist/@types';
const schemaRegistry = new SchemaRegistry({ host: 'http://localhost:8081' });

// Avro schemas
export const createProductSchema: RawAvroSchema = {
  type: 'record',
  name: 'createProduct',
  namespace: 'com.example',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'price', type: 'string' },
  ],
};

export const getProductSchema: RawAvroSchema = {
  type: 'record',
  name: 'idReq',
  namespace: 'com.example',
  fields: [{ name: 'id', type: 'string' }],
};

export const updateProductSchema: RawAvroSchema = {
  type: 'record',
  name: 'updateProduct',
  namespace: 'com.example',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'price', type: 'string' },
  ],
};

// Function to register schema and return the schema ID
export const registerSchema = async (schema: RawAvroSchema) => {
  const { id } = await schemaRegistry.register(schema);
  return id;
};

export { schemaRegistry };
