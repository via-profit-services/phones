import { Middleware, ServerError } from '@via-profit-services/core';
import type { MiddlewareFactory, Configuration } from '@via-profit-services/phones';

import contextMiddleware from './context-middleware';
import resolvers from './resolvers';
import typeDefs from './schema.graphql';

interface Cache {
  typesTableInit: boolean;
}

const middlewareFactory: MiddlewareFactory = async (configuration) => {
  const { entities } = configuration || {} as Configuration;

  const cache: Cache = {
    typesTableInit: false,
  };

  const pool: ReturnType<Middleware> = {
    context: null,
  };

  const typeList = new Set(
    [...entities || []].map((entity) => entity.replace(/[^a-zA-Z]/g, '')),
  );
  typeList.add('VoidPhoneEntity');

  const middleware: Middleware = async ({ context }) => {

    // check knex dependencies
    if (typeof context.knex === 'undefined') {
      throw new ServerError(
        '«@via-profit-services/knex» middleware is missing. If knex middleware is already connected, make sure that the connection order is correct: knex middleware must be connected before',
      );
    }

    // define static context at once
    pool.context = pool.context ?? contextMiddleware({ context, configuration });

    const { services } = pool.context;

    // check to init tables
    if (!cache.typesTableInit) {
      await services.phones.rebaseTypes([...typeList]);
      cache.typesTableInit = true;
    }


    return pool;
  };


  return {
    middleware,
    resolvers,
    typeDefs: `
      ${typeDefs}
      union PhoneEntity = ${[...typeList].join(' | ')}
      enum PhoneType {
        ${[...typeList].join(',\n')}
      }
      `,
  };
};

export default middlewareFactory;
