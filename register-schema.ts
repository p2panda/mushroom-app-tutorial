import fs from 'fs';

import yargs from 'yargs';
import { DocumentViewId, KeyPair, OperationFields, Session } from 'shirokuma';
import { hideBin } from 'yargs/helpers';

// This fixes getting an ECONNREFUSED when making a request against localhost
import { setDefaultResultOrder } from 'node:dns';
setDefaultResultOrder('ipv4first');

type Field = {
  name: string;
  type: string;
};

const MUSHROOM_FIELDS: Field[] = [
  {
    name: 'title',
    type: 'str',
  },
  {
    name: 'edible',
    type: 'bool',
  },
  {
    name: 'latin',
    type: 'str',
  },
  {
    name: 'description',
    type: 'str',
  },
];

const FINDING_FIELDS: Field[] = [
  {
    name: 'blob',
    type: 'str',
  },
  {
    name: 'lat',
    type: 'float',
  },
  {
    name: 'lon',
    type: 'float',
  },
];

type PinnedRelationList = DocumentViewId[];

async function createFields(
  session: Session,
  fields: Field[],
): Promise<PinnedRelationList> {
  const results: PinnedRelationList = [];

  for (const field of fields) {
    const documentViewId = await session.create(field, {
      schemaId: 'schema_field_definition_v1',
    });

    console.log(`Created schema field ${documentViewId}`);
    results.push([documentViewId as string]);
  }

  return results;
}

async function createSchema(
  session: Session,
  name: string,
  description: string,
  fields: PinnedRelationList,
): Promise<string> {
  const operation_fields = new OperationFields({
    name,
    description,
  });
  console.log(fields);
  operation_fields.insert(
    'fields',
    'pinned_relation_list',
    fields as string[][],
  );

  const documentViewId = await session.create(operation_fields, {
    schemaId: 'schema_definition_v1',
  });

  console.log(`Created schema ${name}_${documentViewId as string}`);
  return `${name}_${documentViewId as string}`;
}

async function createMushroomSchema(session: Session): Promise<string> {
  const name = 'mushroom';
  const description = 'Informations and details about mushrooms';
  const fields = await createFields(session, MUSHROOM_FIELDS);
  return await createSchema(session, name, description, fields);
}

async function createFindingSchema(
  session: Session,
  mushroomSchemaId: string,
): Promise<string> {
  const name = 'mushroom_finding';
  const description = 'Picture and GPS position of a found mushroom';

  const findingFields = FINDING_FIELDS.concat([
    {
      name: 'mushrooms',
      type: `relation_list(${mushroomSchemaId})`,
    },
  ]);

  const fields = await createFields(session, findingFields);
  return await createSchema(session, name, description, fields);
}

function loadKeyPair(path: string) {
  if (!path) {
    return new KeyPair();
  }

  try {
    const privateKey = fs.readFileSync(path, 'utf8').replace('\n', '');
    return new KeyPair(privateKey);
  } catch (error) {
    throw new Error(`Could not load private key from ${path}`);
  }
}

async function run(keyPair: KeyPair, endpoint: string) {
  console.log('Create and deploy schemas for the mushroom tutorial app');

  const session = new Session(endpoint).setKeyPair(keyPair);

  const mushroomSchemaId = await createMushroomSchema(session);
  const findingSchemaId = await createFindingSchema(session, mushroomSchemaId);

  console.log();
  console.log(
    'Next step: Create a file `./schemas.json` and paste this into it:',
  );
  console.log('{');
  console.log(`  "MUSHROOM_SCHEMA_ID": "${mushroomSchemaId}",`);
  console.log(`  "FINDINGS_SCHEMA_ID": "${findingSchemaId}"`);
  console.log('}');
}

const { argv } = yargs(hideBin(process.argv))
  .usage('Usage: --privateKey [path] --endpoint [url]')
  .option('privateKey', {
    alias: 'k',
    describe: 'Path to file holding private key',
    type: 'string',
  })
  .option('endpoint', {
    alias: 'e',
    describe: 'Endpoint of p2panda node',
    type: 'string',
    default: 'http://localhost:2020/graphql',
  });

type Args = {
  privateKey: string | undefined;
  endpoint: string;
};

const { privateKey, endpoint } = argv as unknown as Args;
const keyPair = loadKeyPair(privateKey);

run(keyPair, endpoint);
