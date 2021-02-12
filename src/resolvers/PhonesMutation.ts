import { ServerError, BadRequestError } from '@via-profit-services/core';
import type { Resolvers } from '@via-profit-services/phones';


const phonesMutationResolver: Resolvers['PhonesMutation'] = {
  update: async (_parent, args, context) => {
    const { id, input } = args;
    const { dataloader, services } = context;

    const prevPhoneData = await dataloader.phones.load(id);

    if (!prevPhoneData) {
      throw new BadRequestError(`Phone with id «${id}» was not found`);
    }

    try {
      await services.phones.updatePhone(id, input);
    } catch (err) {
      throw new ServerError('Failed to update phone', { err, id });
    }

    dataloader.phones.clear(id);

    return { id };
  },
  create: async (_parent, args, context) => {
    const { input } = args;
    const { services, dataloader } = context;

    // check to exists
    if (typeof input.id !== 'undefined') {
      const existsPhone = await dataloader.phones.load(input.id);

      if (!existsPhone) {
        throw new BadRequestError(`Phone with id «${input.id}» already exists`);
      }
    }


    try {
      const id = await services.phones.createPhone(input);

      return { id };

    } catch (err) {
      throw new ServerError('Failed to create phone', { err });
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
      throw new ServerError('Failed to remove phones', { ids: removeIDs, err });
    }
  },
};

export default phonesMutationResolver;
