import { Middleware, ServerError, collateForDataloader, DataLoaderCollection } from '@via-profit-services/core';
import type { MiddlewareFactory, Configuration } from '@via-profit-services/phones';
import DataLoader from 'dataloader';

import PhonesService from './PhonesService';
import resolvers from './resolvers';
import typeDefs from './schema.graphql';


const middlewareFactory: MiddlewareFactory = async (configuration) => {
  let typesTableInit = false;
  const { entities } = configuration || {} as Configuration;
  const typeList = new Set(
    [...entities || []].map((entity) => entity.replace(/[^a-zA-Z]/g, '')),
  );
  
  const dataloadersMap = new Map<string, DataLoaderCollection['phones']>();
  
  typeList.add('VoidPhoneEntity');

  const middleware: Middleware = async ({ context }) => {

    // check knex dependencies
    if (typeof context.knex === 'undefined') {
      throw new ServerError(
        '«@via-profit-services/knex» middleware is missing. If knex middleware is already connected, make sure that the connection order is correct: knex middleware must be connected before',
      );
    }

    // inject phones service
    context.services.phones = new PhonesService({ context, entities });

    // init dataloader
    if (!dataloadersMap.get('phones')) {
      const phonesLoader = new DataLoader(async (ids: string[]) => {
        const nodes = await context.services.phones.getPhonesByIds(ids);
        
        return collateForDataloader(ids, nodes);
      });
      dataloadersMap.set('phones', phonesLoader);
    }
    
    // inject phones dataloader
    context.dataloader.phones = dataloadersMap.get('phones');


    // check to init tables
    if (!typesTableInit) {
      await context.services.phones.rebaseTypes([...typeList]);
      typesTableInit = true;
    }

    return {
      context,
    };
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
