import { Middleware, ServerError } from '@via-profit-services/core';
import type { MiddlewareFactory, Configuration } from '@via-profit-services/phones';

import contextMiddleware from './context-middleware';
import resolvers from './resolvers';
import typeDefs from './schema.graphql';

const middlewareFactory: MiddlewareFactory = (configuration) => {
  const { entities } = configuration || {} as Configuration;

  const pool: ReturnType<Middleware> = {
    context: null,
  };

  const middleware: Middleware = ({ context }) => {

    // check knex dependencies
    if (typeof context.knex === 'undefined') {
      throw new ServerError(
        '«@via-profit-services/knex» middleware is missing. If knex middleware is already connected, make sure that the connection order is correct: knex middleware must be connected before',
      );
    }

    // define static context at once
    pool.context = pool.context ?? contextMiddleware({ context });

    return pool;
  };

  const typeList = new Set(entities);
  typeList.add('VoidPhoneEntity');

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
