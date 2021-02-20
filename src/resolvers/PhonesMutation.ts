import { ServerError } from '@via-profit-services/core';
import type { Resolvers } from '@via-profit-services/phones';


const phonesMutationResolver: Resolvers['PhonesMutation'] = {
  replace: async (_parent, args, context) => {
    const { entity, input } = args;
    const { dataloader, services } = context;

    try {
      const { affected, persistens } = await services.phones.replacePhones(entity, input);
      affected.forEach((id) => {
        dataloader.phones.clear(id);
      });

      return persistens.map((id) => ({ id }));

    } catch (err) {
      throw new ServerError('Failed to replace phones', { err });
    }
  },
  update: async (_parent, args, context) => {
    const { id, input } = args;
    const { dataloader, services } = context;

    try {
      await services.phones.updatePhone(id, input);
    } catch (err) {
      throw new ServerError('Failed to update phone', { err });
    }

    dataloader.phones.clear(id);

    return { id };
  },
  create: async (_parent, args, context) => {
    const { input } = args;
    const { services, dataloader } = context;


    try {
      const id = await services.phones.createPhone(input);
      dataloader.phones.clear(id);

      return { id };

    } catch (err) {
      throw new ServerError('Failed to create phone', { err });
    }
  },
  delete: async (_parent, args, context) => {
    const { services, dataloader } = context;
    const { id, ids } = args;

    const removeIDs = [
      ...ids || [],
      ...(id ? [id] : []),
    ];

    try {
      await services.phones.deletePhones(removeIDs);

      removeIDs.forEach((id) => {
        dataloader.phones.clear(id);
      });

      return null;

    } catch (err) {
      throw new ServerError('Failed to remove phones', { ids: removeIDs, err });
    }
  },
};

export default phonesMutationResolver;
