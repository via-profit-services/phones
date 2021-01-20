import Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return knex.raw(`

    DROP TABLE IF EXISTS "phones";
    CREATE TABLE "phones" (
      "id" uuid NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now(),
      "entity" uuid NOT NULL,
      "type" varchar(50) NOT NULL DEFAULT 'VoidPhoneEntity',
      "country" varchar(4) NOT NULL,
      "number" varchar(20) NOT NULL,
      "metaData" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "confirmed" boolean NOT NULL DEFAULT false,
      "primary" boolean NOT NULL DEFAULT true,
      "description" text NOT NULL,
      CONSTRAINT phones_pkey PRIMARY KEY (id)
    );
 
    CREATE INDEX "phonesEntityIndex" ON phones USING btree (entity);
  `);
}

export async function down(knex: Knex): Promise<any> {
  return knex.raw(`
    DROP TABLE IF EXISTS "phones" CASCADE;
  `);
}
