import { Context, collateForDataloader } from '@via-profit-services/core';
import { Configuration } from '@via-profit-services/phones';
import DataLoader from 'dataloader';

import PhonesService from './PhonesService';

interface Props {
  context: Context;
  configuration: Configuration;
}

const contextMiddleware = (props: Props): Context => {

  const { context, configuration } = props;
  const { entities } = configuration;

  // phone service
  context.services.phones = new PhonesService({ context, entities });

  // Phones Dataloader
  context.dataloader.phones = new DataLoader(async (ids: string[]) => {
    const nodes = await context.services.phones.getPhonesByIds(ids);

    return collateForDataloader(ids, nodes);
  });


  return context;
}

export default contextMiddleware;
