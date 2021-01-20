import { ServerError } from '@via-profit-services/core';
import type { Resolvers } from '@via-profit-services/phones';


const phonesMutationResolver: Resolvers['PhonesMutation'] = {
  update: async (_parent, args, context) => {
    const { id, input } = args;
    const { dataloader, services } = context;

    try {
      await services.phones.updatePhone(id, {
        ...input,
        entity: input.entity
          ? { id: input.entity }
          : undefined,
      });
    } catch (err) {
      throw new ServerError('Failed to update phone', { input, id });
    }

    dataloader.phones.clear(id);

    return { id };
  },
  create: async (_parent, args, context) => {
    const { input } = args;
    const { services } = context;

    try {
      const id = await services.phones.createPhone({
        ...input,
        entity: input.entity
          ? { id: input.entity }
          : undefined,
      });

      return { id };

    } catch (err) {
      throw new ServerError('Failed to create phone', { input });
    }
  },
  delete: async (_parent, args, context) => {
    const { services } = context;
    const { id, ids } = args;

    const removeIDs = [
      ...ids || [],
      ...(id ? [id] : []),
    ];

    try {
      await services.phones.deletePhones(removeIDs);

      return null;

    } catch (err) {
      throw new ServerError('Failed to remove phones', { ids: removeIDs });
    }
  },
};

export default phonesMutationResolver;
