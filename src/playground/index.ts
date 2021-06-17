/* eslint-disable no-console */
import { makeExecutableSchema } from '@graphql-tools/schema';
import { factory, resolvers, typeDefs } from '@via-profit-services/core';
import * as knex from '@via-profit-services/knex';
import * as redis from '@via-profit-services/redis';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';

import { factory as phonesFactory } from '../index';

dotenv.config();

(async () => {

  const port = Number(process.env.PORT);
  const app = express();
  const server = createServer(app);

  const redisMiddleware = redis.factory();

  const phones = await phonesFactory({
    entities: ['SomePerson'],
  });

  const schema = makeExecutableSchema({
    typeDefs: [
      typeDefs,
      phones.typeDefs,
      `
      """Just for example"""
      type SomePerson {
        id: ID!
        name: String!
        phones: [Phone!]
      }`,
    ],
    resolvers: [
      resolvers,
      phones.resolvers,
      {
        SomePerson: {
          id: () => 'c39c67fc-10da-4856-886d-7e9e04309a38',
          name: () => 'Some person name',
          phones: () => [{ id: '9a10caa2-ec4a-4582-a4ad-2360a909197e' }],
        },
      },
    ],
  });

  const knexMiddleware = knex.factory({
    connection: {
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
    },
  });

  const { graphQLExpress } = await factory({
    server,
    schema,
    debug: process.env.DEBUG === 'true',
    middleware: [
      knexMiddleware,
      redisMiddleware,
      phones.middleware,
    ],
  });

  app.use(graphQLExpress);
  server.listen(port, () => {
    console.log(`Started at http://localhost:${port}/graphql`);
  });
})();