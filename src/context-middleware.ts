import { Context, collateForDataloader } from '@via-profit-services/core';
import DataLoader from 'dataloader';

import PhonesService from './PhonesService';

interface Props {
  context: Context;
}

const contextMiddleware = (props: Props): Context => {

  const { context } = props;

  // phone service
  context.services.phones = new PhonesService({ context });

  // Phones Dataloader
  context.dataloader.phones = new DataLoader(async (ids: string[]) => {
    const nodes = await context.services.phones.getPhonesByIds(ids);

    return collateForDataloader(ids, nodes);
  });


  return context;
}

export default contextMiddleware;
