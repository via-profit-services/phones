import { ServerError, buildCursorConnection, buildQueryFilter, CursorConnection } from '@via-profit-services/core';
import type { Phone, Resolvers } from '@via-profit-services/phones';


export const PhonesQueryResolver: Resolvers['PhonesQuery'] = {
  list: async (_source, args, context): Promise<CursorConnection<Phone>> => {
    const { dataloader, services } = context;
    const filter = buildQueryFilter(args);

    try {
      const phonesConnection = await services.phones.getPhones(filter);
      const connection = buildCursorConnection(phonesConnection, 'phones');
      await dataloader.phones.primeMany(phonesConnection.nodes)

      return connection;
    } catch (err) {
      console.error(err)
      throw new ServerError('Failed to get Phones list', { err });
    }
  },
  phone: async (_source, args, context): Promise<Phone> => {
    const { id } = args;
    const { dataloader } = context;
    const phone = await dataloader.phones.load(id);

    return phone;
  },
};

export default PhonesQueryResolver;
