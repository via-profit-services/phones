import {Knex} from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.raw(`

    DROP TABLE IF EXISTS "phonesTypes";
    CREATE TABLE "phonesTypes" (
      "type" varchar(50) NOT NULL,
      CONSTRAINT "phonesTypes_un" UNIQUE (type)
    );

    DROP TABLE IF EXISTS "phones";
    CREATE TABLE "phones" (
      "id" uuid NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "entity" uuid NOT NULL,
      "type" varchar(50) NOT NULL DEFAULT 'VoidPhoneEntity'::character varying,
      "country" varchar(4) NOT NULL,
      "number" varchar(20) NOT NULL,
      "metaData" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "confirmed" boolean NOT NULL DEFAULT false,
      "primary" boolean NOT NULL DEFAULT true,
      "description" text default NULL,
      CONSTRAINT phones_pkey PRIMARY KEY (id)
    );
 
    ALTER TABLE "phones" ADD CONSTRAINT phones_type_fk FOREIGN KEY (type) REFERENCES "phonesTypes"(type) ON DELETE CASCADE;
    CREATE INDEX "phonesEntityIndex" ON phones USING btree (entity);
  `);
}

export async function down(knex: Knex): Promise<any> {
  return knex.raw(`
    DROP TABLE IF EXISTS "phones" CASCADE;
    DROP TABLE IF EXISTS "phonesTypes" CASCADE;
  `);
}
