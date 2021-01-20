import type { Resolvers } from '@via-profit-services/phones';

import Mutation from './Mutation';
import Phone from './Phone';
import PhonesMutation from './PhonesMutation';
import PhonesQuery from './PhonesQuery';
import Query from './Query';

const resolvers: Resolvers = {
  Mutation,
  Query,
  Phone,
  PhonesMutation,
  PhonesQuery,
}

export default resolvers;
