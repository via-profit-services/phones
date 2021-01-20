import { ServerError } from '@via-profit-services/core';
import type { PhoneResolver } from '@via-profit-services/phones';

const phoneResolver = new Proxy<PhoneResolver>({
  id: () => ({}),
  createdAt: () => ({}),
  updatedAt: () => ({}),
  country: () => ({}),
  number: () => ({}),
  entity: () => ({}),
  type: () => ({}),
  confirmed: () => ({}),
  primary: () => ({}),
  description: () => ({}),
  metaData: () => ({}),
  countryCallingCode: () => ({}),
  numberType: () => ({}),
  formatted: () => ({}),
}, {
  get: (target, prop: keyof PhoneResolver) => {
    const resolver: PhoneResolver[keyof PhoneResolver] = async (parent, _args, context) => {
      const { id } = parent;
      const { dataloader } = context;

      const phone = await dataloader.phones.load(id);
      try {

        if (prop === 'entity') {
          return {
            __typename: phone.type,
            ...phone.entity,
          }
        }

        return phone[prop];
      } catch ( err ) {
        throw new ServerError(
          `Failed to load phone with id «${id}»`, { id, message: err.message },
        )
      }
    };

    return resolver;
  },
});

export default phoneResolver;
