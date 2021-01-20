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
          countryCallingCode: String(phoneNumber.countryCallingCode || ''),
          numberType: phoneNumber.getType(),
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


  public prepareDataToInsert(input: Partial<Phone>): Partial<PhonesTableModel> {
    const { context } = this.props;
    const { timezone } = context;
    const phoneData: Partial<PhonesTableModel> = {
      ...input,
      entity: input.entity ? input.entity.id : undefined,
      metaData: input.metaData ? JSON.stringify(input.metaData) : undefined,
      createdAt: input.createdAt ? moment.tz(input.createdAt, timezone).format() : undefined,
      updatedAt: input.updatedAt ? moment.tz(input.updatedAt, timezone).format() : undefined,
    };

    return phoneData;
  }

  public async updatePhone(id: string, phoneData: Partial<Phone>) {
    const { knex, timezone } = this.props.context;

    const data = this.prepareDataToInsert({
      ...phoneData,
      updatedAt: moment.tz(timezone).toDate(),
    });

    await knex<PhonesTableModel>('phones')
      .update(data)
      .where('id', id)
      .returning('id');
  }

  public async createPhone(phoneData: Partial<Phone>) {
    const { knex, timezone } = this.props.context;
    const createdAt = moment.tz(timezone).toDate();

    const data = this.prepareDataToInsert({
      ...phoneData,
      id: phoneData.id ? phoneData.id : uuidv4(),
      createdAt,
      updatedAt: createdAt,
    });
    const result = await knex<PhonesTableModel>('phones').insert(data).returning('id');

    return result[0];
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

}

export default PhonesService;
