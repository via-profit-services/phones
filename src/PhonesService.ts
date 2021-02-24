import { OutputFilter, ListResponse, Node } from '@via-profit-services/core';
import {
  convertWhereToKnex, convertOrderByToKnex,
  convertSearchToKnex, extractTotalCountPropOfNode,
} from '@via-profit-services/knex';
import type {
  Phone,
  PhonesServiceProps,
  PhonesTableModelResult,
  PhonesTableModel,
  PhoneCreateInput,
  PhoneUpdateInput,
  PhoneCreateOrUpdateInput,
  PhoneReplaceInput,
  ReplacePhonesResult,
} from '@via-profit-services/phones';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

class PhonesService {
  props: PhonesServiceProps;

  public constructor(props: PhonesServiceProps) {
    this.props = props;
  }

  public async getPhonesByEntities(entitiesIDs: string[]): Promise<ListResponse<Phone>> {
    const phones = await this.getPhones({
      limit: Number.MAX_SAFE_INTEGER,
      where: [
        ['entity', 'in', entitiesIDs],
      ],
    });

    return phones;
  }

  public async getPhonesByEntity(entityID: string): Promise<ListResponse<Phone>> {
    return this.getPhonesByEntities([entityID]);
  }


  public async getPhones(filter: Partial<OutputFilter>): Promise<ListResponse<Phone>> {
    const { context } = this.props;
    const { knex } = context;
    const { limit, offset, orderBy, where, search } = filter;

    const result = await knex
      .select([
        'phones.*',
        knex.raw('count(*) over() as "totalCount"'),
      ])
      .from<PhonesTableModel, PhonesTableModelResult[]>('phones')
      .orderBy(convertOrderByToKnex(orderBy))
      .where((builder) => convertWhereToKnex(builder, where))
      .where((builder) => convertSearchToKnex(builder, search))
      .limit(limit || 1)
      .offset(offset || 0)
      .then((nodes) => nodes.map((node) => {

        const phoneNumber = parsePhoneNumberFromString(
          node.number,
          node.country as CountryCode,
        );

        const phoneNode: Node<Phone> & Pick<PhonesTableModelResult, 'totalCount'> = {
          ...node,
          formatted: {
            national: phoneNumber.formatNational(),
            international: phoneNumber.formatInternational(),
            uri: phoneNumber.getURI(),
          },
          description: node.description || '',
          countryCallingCode: String(phoneNumber.countryCallingCode || ''),
          entity: !node.entity ? null : {
            id: node.entity,
          },
        };

        return phoneNode;
      }))
      .then((nodes) => ({
        ...extractTotalCountPropOfNode(nodes),
          offset,
          limit,
          orderBy,
          where,
        }))

    return result;
  }

  public async getPhonesByIds(ids: string[]): Promise<Phone[]> {
    const { nodes } = await this.getPhones({
      where: [['id', 'in', ids]],
      offset: 0,
      limit: ids.length,
    });

    return nodes;
  }

  public async getPhone(id: string): Promise<Phone | false> {
    const nodes = await this.getPhonesByIds([id]);

    return nodes.length ? nodes[0] : false;
  }

  public getDefaultPhoneRecord(): PhonesTableModel {
    const { timezone } = this.props.context;

    const createdAt = moment.tz(timezone).format();
    const phoneData: PhonesTableModel = {
      createdAt,
      updatedAt: createdAt,
      id: uuidv4(),
      metaData: undefined,
      country: 'RU',
      number: '',
      description: null,
      primary: false,
      confirmed: false,
      entity: '',
      type: 'User',
    };

    return phoneData;
  }

  public prepareDataToInsert(input: PhoneCreateInput | PhoneUpdateInput): PhonesTableModel {
    const phoneData: PhonesTableModel = {
      ...this.getDefaultPhoneRecord(),
      ...input,
      metaData: input.metaData ? JSON.stringify(input.metaData) : undefined,
    };

    return phoneData;
  }

  public async updatePhone(id: string, phone: PhoneUpdateInput) {

    const defaultPhoneData = this.getDefaultPhoneRecord();
    const phones = [phone].map((data) => ({
      ...defaultPhoneData,
      id,
      ...data,
    }));
    const insertedIDs = await this.createOrUpdatePhones(phones);

    return insertedIDs[0];
  }

  public async createPhone(phone: PhoneCreateInput) {

    const defaultPhoneData = this.getDefaultPhoneRecord();
    const phones = [phone].map((data) => ({
      ...defaultPhoneData,
      ...data,
    }));
    const insertedIDs = await this.createOrUpdatePhones(phones);

    return insertedIDs[0];
  }

  public async createOrUpdatePhones (phones: PhoneCreateOrUpdateInput[]): Promise<string[]> {
    const { context } = this.props;
    const { knex, timezone } = context;

    const createdAt = moment.tz(timezone).toDate();
    const phonesPrepared = phones.map((phone) => ({
      ...this.prepareDataToInsert(phone),
      createdAt,
      updatedAt: createdAt,
    }));

    const response = await knex.raw(
      `${knex('phones').insert(phonesPrepared).toQuery()} \
      on conflict ("id") do update set \
        "updatedAt" = excluded."updatedAt",\
        "entity" = excluded."entity",\
        "type" = excluded."type",\
        "number" = excluded."number",\
        "country" = excluded."country",\
        "metaData" = excluded."metaData",\
        "confirmed" = excluded."confirmed",\
        "primary" = excluded."primary",\
        "description" = excluded."description"\
      returning id;`,
    );

    return (response as {rows: Array<{id: string}>})
      .rows
      .map(({ id }) => id);
  }

  public async replacePhones (
    entity: string,
    phones: PhoneReplaceInput[],
  ): Promise<ReplacePhonesResult> {

    const oldPhones = await this.getPhonesByEntity(entity);
    const phonesToReplace = phones.map((phone) => {
      const oldPhoneData = oldPhones.nodes.find(({ id }) => id === phone.id);
      const {
        number,
        country,
        type,
        metaData,
        confirmed,
        primary,
        description,
      } = oldPhoneData || this.getDefaultPhoneRecord();

      return {
        number,
        country,
        type,
        metaData,
        confirmed,
        primary,
        description,
        ...phone,
        entity,
      }
    });

    const newPhoneIdsOfThisEntity = await this.createOrUpdatePhones(phonesToReplace);

    const phoneIDsToDelete = oldPhones.nodes
      .filter(({ id }) => !newPhoneIdsOfThisEntity.includes(id))
      .map(({ id }) => id);

    await this.deletePhones(phoneIDsToDelete);

    return {
      deleted: phoneIDsToDelete,
      persistens: newPhoneIdsOfThisEntity,
      affected: phoneIDsToDelete.concat(newPhoneIdsOfThisEntity),
    };
  }

  public async deletePhones(ids: string[]) {
    const { context } = this.props;
    const { knex } = context;

    await knex<PhonesTableModel>('phones')
      .del()
      .whereIn('id', ids);
  }

  public async deletePhone(id: string) {
    return this.deletePhones([id]);
  }

  public async deletePhonesByEntities(entitiesIDs: string[]): Promise<void> {
    const { context } = this.props;
    const { knex } = context;

    await knex<PhonesTableModel>('phones')
      .del()
      .whereIn('entity', entitiesIDs);
  }

  public async deletePhonesByEntity(entityID: string): Promise<void> {
    return this.deletePhonesByEntities([entityID]);
  }

  public async rebaseTypes(types: string[]): Promise<void> {
    const { context } = this.props;
    const { knex } = context;

    const payload = types.map((type) => ({ type }));
    await knex.raw(`${knex('phonesTypes').insert(payload).toString()} on conflict ("type") do nothing;`);
    await knex('phonesTypes').del().whereNotIn('type', types);
  }

  public getEntitiesTypes() {
    const { entities } = this.props;

    return entities;
  }

}

export default PhonesService;
