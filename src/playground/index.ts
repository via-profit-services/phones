/* eslint-disable no-console */
import { makeExecutableSchema } from '@graphql-tools/schema';
import { factory, resolvers, typeDefs } from '@via-profit-services/core';
import * as knex from '@via-profit-services/knex';
import express from 'express';
import { createServer } from 'http';

import * as phones from '../index';

(async () => {

  const port = Number(process.env.PORT);
  const app = express();
  const server = createServer(app);
  const phonesMiddleware = phones.factory();

  const schema = makeExecutableSchema({
    typeDefs: [
      typeDefs,
      phones.typeDefs,
    ],
    resolvers: [
      resolvers,
      phones.resolvers,
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
      phonesMiddleware,
    ],
  });

  app.use(graphQLExpress);
  server.listen(port, () => {
    console.log(`Started at http://localhost:${port}/graphql`);
  });
})();