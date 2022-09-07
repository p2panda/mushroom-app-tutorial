import { GraphQLClient, gql, RequestDocument } from 'graphql-request';
import {
  KeyPair,
  OperationFields,
  encodeOperation,
  signAndEncodeEntry,
} from 'p2panda-js';

import { ENDPOINT, MUSHROOM_SCHEMA_ID, FINDINGS_SCHEMA_ID } from './constants';

import type {
  Mushroom,
  MushroomResponse,
  NextArgs,
  Picture,
  PictureResponse,
} from './types.d';

const client = new GraphQLClient(ENDPOINT);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request(query: RequestDocument, variables?: any) {
  try {
    return await client.request(query, variables);
  } catch (error) {
    console.error(error);

    window.alert(
      'Error: Could not connect to node.\n\n- Did you start the node at port `2020`?\n- Did you deploy the schemas (via `npm run schema`) and changed the schema ids in `./src/constants.ts`?',
    );
  }
}

async function nextArgs(publicKey: string, viewId?: string): Promise<NextArgs> {
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

  const result = await request(query, {
    publicKey,
    viewId,
  });

  return result.nextArgs;
}

export async function publish(
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

  const result = await request(query, {
    entry,
    operation,
  });

  return result.publish;
}

export async function getAllMushrooms(): Promise<MushroomResponse[]> {
  const query = gql`{
    mushrooms: all_${MUSHROOM_SCHEMA_ID} {
      meta {
        documentId
        viewId
      }
      fields {
        description
        edible
        latin
        title
      }
    }
  }`;

  const result = await request(query);
  return result.mushrooms;
}

export async function getMushroom(
  documentId: string,
): Promise<MushroomResponse> {
  const query = gql`{
    mushroom: ${MUSHROOM_SCHEMA_ID}(id: "${documentId}") {
      meta {
        documentId
        viewId
      }
      fields {
        description
        edible
        latin
        title
      }
    }
  }`;

  const result = await request(query);
  return result.mushroom;
}

export async function createMushroom(
  keyPair: KeyPair,
  values: Mushroom,
): Promise<void> {
  const args = await nextArgs(keyPair.publicKey());
  const operation = encodeOperation({
    schemaId: MUSHROOM_SCHEMA_ID,
    fields: {
      ...values,
    },
  });

  const entry = signAndEncodeEntry(
    {
      ...args,
      operation,
    },
    keyPair,
  );

  await publish(entry, operation);
}

export async function updateMushroom(
  keyPair: KeyPair,
  previous: string,
  values: Mushroom,
): Promise<void> {
  const args = await nextArgs(keyPair.publicKey(), previous);
  const operation = encodeOperation({
    action: 'update',
    schemaId: MUSHROOM_SCHEMA_ID,
    previous,
    fields: {
      ...values,
    },
  });

  const entry = signAndEncodeEntry(
    {
      ...args,
      operation,
    },
    keyPair,
  );

  await publish(entry, operation);
}

export async function getAllPictures(): Promise<PictureResponse[]> {
  const query = gql`{
    pictures: all_${FINDINGS_SCHEMA_ID} {
      meta {
        documentId
        viewId,
      }
      fields {
        blob
        lat
        lon
        mushrooms {
          meta {
            documentId
            viewId
          }
          fields {
            description
            edible
            latin
            title
          }
        }
      }
    }
  }`;

  const result = await request(query);
  return result.pictures;
}

export async function createPicture(keyPair: KeyPair, values: Picture) {
  const args = await nextArgs(keyPair.publicKey());
  const { blob, lat, lon, mushrooms } = values;

  const fields = new OperationFields({
    blob,
    lat,
    lon,
  });
  fields.insert('mushrooms', 'relation_list', mushrooms);

  const operation = encodeOperation({
    schemaId: FINDINGS_SCHEMA_ID,
    fields,
  });

  const entry = signAndEncodeEntry(
    {
      ...args,
      operation,
    },
    keyPair,
  );

  await publish(entry, operation);
}
