import fs from 'fs';

import yargs from 'yargs';
import { GraphQLClient, gql } from 'graphql-request';
import {
  KeyPair,
  OperationFields,
  encodeOperation,
  signAndEncodeEntry,
} from 'p2panda-js';
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

type PinnedRelationList = string[][];

type NextArgs = {
  logId: string;
  seqNum: string;
  backlink?: string;
  skiplink?: string;
};

async function nextArgs(
  client: GraphQLClient,
  publicKey: string,
  viewId?: string,
): Promise<NextArgs> {
  const query = gql`
    query NextArgs($publicKey: String!, $viewId: String) {
      nextArgs(publicKey: $publicKey, viewId: $viewId) {
        logId
        seqNum
        backlink
        skiplink
      }
    }
  `;

  const result = await client.request(query, {
    publicKey,
    viewId,
  });

  return result.nextArgs;
}

async function publish(
  client: GraphQLClient,
  entry: string,
  operation: string,
): Promise<NextArgs> {
  const query = gql`
    mutation Publish($entry: String!, $operation: String!) {
      publish(entry: $entry, operation: $operation) {
        logId
        seqNum
        backlink
        skiplink
      }
    }
  `;

  const result = await client.request(query, {
    entry,
    operation,
  });

  return result.publish;
}

async function createFields(
  client: GraphQLClient,
  keyPair: KeyPair,
  fields: Field[],
): Promise<PinnedRelationList> {
  const results: PinnedRelationList = [];

  for (const field of fields) {
    const args = await nextArgs(client, keyPair.publicKey());

    const payload = encodeOperation({
      action: 'create',
      schemaId: 'schema_field_definition_v1',
      fields: {
        ...field,
      },
    });

    const entry = signAndEncodeEntry(
      {
        ...args,
        payload,
      },
      keyPair,
    );

    const { backlink } = await publish(client, entry, payload);
    console.log(`Created schema field ${backlink}`);
    results.push([backlink]);
  }

  return results;
}

async function createSchema(
  client: GraphQLClient,
  keyPair: KeyPair,
  name: string,
  description: string,
  fields: PinnedRelationList,
): Promise<string> {
  const args = await nextArgs(client, keyPair.publicKey());

  const operationFields = new OperationFields({
    name,
    description,
  });
  operationFields.insert('fields', 'pinned_relation_list', fields);

  const payload = encodeOperation({
    action: 'create',
    schemaId: 'schema_definition_v1',
    fields: operationFields,
  });

  const entry = signAndEncodeEntry(
    {
      ...args,
      payload,
    },
    keyPair,
  );

  const { backlink } = await publish(client, entry, payload);
  console.log(`Created schema ${name}_${backlink}`);
  return `${name}_${backlink}`;
}

async function createMushroomSchema(
  client: GraphQLClient,
  keyPair: KeyPair,
): Promise<string> {
  const name = 'mushroom';
  const description = 'Informations and details about mushrooms';
  const fields = await createFields(client, keyPair, MUSHROOM_FIELDS);
  return await createSchema(client, keyPair, name, description, fields);
}

async function createFindingSchema(
  client: GraphQLClient,
  keyPair: KeyPair,
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

  const fields = await createFields(client, keyPair, findingFields);
  return await createSchema(client, keyPair, name, description, fields);
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

  const client = new GraphQLClient(endpoint);

  const mushroomSchemaId = await createMushroomSchema(client, keyPair);
  const findingSchemaId = await createFindingSchema(
    client,
    keyPair,
    mushroomSchemaId,
  );

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
