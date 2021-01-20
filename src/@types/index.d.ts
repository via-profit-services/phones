// Type definitions for @via-profit-services/phones
// Project: git@github.com:via-profit-services/phones
// Definitions by: Via Profit <https://github.com/via-profit-services>
// Warning: This is not autogenerated definitions!

/// <reference types="node" />
declare module '@via-profit-services/phones' {
  import { GraphQLFieldResolver } from 'graphql';
  import { Context, Middleware, InputFilter, OutputFilter, ListResponse } from '@via-profit-services/core';
  import { NumberType } from 'libphonenumber-js';

  export type Configuration = {
    /**
     * You can add Account entities.\
     * The entities that will be passed here will be added 
     * to the types: \
     * `enum AccountType` \
     * `union AccountEntity`
     */
    entities?: string[];
  };

  export interface Phone {
    id: string;
    updatedAt: Date;
    createdAt: Date;
    number: string;
    country: string;
    description: string;
    primary: boolean;
    confirmed: boolean;
    metaData?: any;
    type: string;
    entity: {
      id: string;
    };

    // -- addons fields
    countryCallingCode: string;
    formatted: PhoneFormatted;
  }

  export interface PhoneFormatted {
    national: string;
    international: string;
    uri: string;
  }

  export type MiddlewareFactory = (configuration?: Configuration) => {
    middleware: Middleware;
    typeDefs: string;
    resolvers: Resolvers;
  };

  /**
   * Accounts service constructor props
   */
  export interface PhonesServiceProps {
    context: Context;
  }

  class PhonesService {
    constructor(props: PhonesServiceProps);
    getPhones(filter: Partial<OutputFilter>): Promise<ListResponse<Phone>>;
    getPhonesByIds(ids: string[]): Promise<Phone[]>;
    getPhone(id: string): Promise<Phone | false>;
    prepareDataToInsert(input: Partial<Phone>): Partial<PhonesTableModel>;
    updatePhone(id: string, phoneData: Partial<Phone>): Promise<void>;
    createPhone(phoneData: Partial<Phone>): Promise<string>;
    deletePhones(ids: string[]): Promise<void>;
    deletePhone(id: string): Promise<void>;
    getPhonesByEntities(entitiesIDs: string[]): Promise<ListResponse<Phone>>;
    getPhonesByEntity(entityID: string): Promise<ListResponse<Phone>>;
    deletePhonesByEntities(entitiesIDs: string[]): Promise<void>;
    deletePhonesByEntity(entityID: string): Promise<void>;
  }


  export interface PhonesTableModel {
    readonly id: string;
    readonly updatedAt: string;
    readonly createdAt: string;
    readonly number: string;
    readonly country: string;
    readonly description: string;
    readonly primary: boolean;
    readonly confirmed: boolean;
    readonly metaData: unknown | null;
    readonly type: string;
    readonly entity: string;
  }

  export interface PhonesTableModelResult {
    readonly id: string;
    readonly updatedAt: Date;
    readonly createdAt: Date;
    readonly number: string;
    readonly country: string;
    readonly description: string;
    readonly primary: boolean;
    readonly confirmed: boolean;
    readonly metaData: unknown | null;
    readonly type: string;
    readonly entity: string;
    readonly totalCount: number;
  }


  export type Resolvers = {
    Query: {
      phones: GraphQLFieldResolver<unknown, Context>;
    };
    Mutation: {
      phones: GraphQLFieldResolver<unknown, Context>;
    };
    PhonesQuery: {
      list: GraphQLFieldResolver<unknown, Context, InputFilter>;
      phone: GraphQLFieldResolver<unknown, Context, {
        id: string;
      }>;
    };
    PhonesMutation: {
      create: GraphQLFieldResolver<unknown, Context, {
        input: {
          id?: string;
          number: string;
          country: string;
          description: string;
          primary: boolean;
          confirmed: boolean;
          type: string;
          entity: string;
          metaData?: any;
        };
      }>;
      update: GraphQLFieldResolver<unknown, Context, {
        id: string;
        input: {
          id?: string;
          number?: string;
          country?: string;
          description?: string;
          primary?: boolean;
          confirmed?: boolean;
          type?: string;
          entity?: string;
          metaData?: any;
        };
      }>;
      delete: GraphQLFieldResolver<unknown, Context, {
        id?: string;
        ids?: string[];
      }>;
    };
    Phone: PhoneResolver;
  };

  export type PhoneResolver = Record<keyof Phone, GraphQLFieldResolver<{  id: string }, Context>>;

  export const factory: MiddlewareFactory;
}


declare module '@via-profit-services/core' {
  import { PhonesService, Phone } from '@via-profit-services/phones';
  import DataLoader from 'dataloader';

  interface ServicesCollection {
    /**
     * Phones service
     */
    phones: PhonesService;
  }

    interface DataLoaderCollection {
    /**
     * Accounts dataloader
     */
    phones: DataLoader<string, Node<Phone>>;
  }
}