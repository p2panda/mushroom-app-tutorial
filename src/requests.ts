import { GraphQLClient, gql } from 'graphql-request';
import {
  KeyPair,
  OperationFields,
  encodeOperation,
  signAndEncodeEntry,
} from 'p2panda-js';

import { ENDPOINT, MUSHROOM_SCHEMA_ID, PICTURE_SCHEMA_ID } from './constants';

import type {
  Mushroom,
  MushroomResponse,
  NextArgs,
  Picture,
  PictureResponse,
} from './types.d';

const client = new GraphQLClient(ENDPOINT);

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

  const result = await client.request(query, {
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

  const result = await client.request(query, {
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

  const result = await client.request(query);
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

  const result = await client.request(query);
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
      payload: operation,
    },
    keyPair,
  );

  await publish(entry, operation);
}

export async function updateMushroom(
  keyPair: KeyPair,
  viewId: string,
  values: Mushroom,
): Promise<void> {
  const args = await nextArgs(keyPair.publicKey(), viewId);
  const operation = encodeOperation({
    action: 'update',
    schemaId: MUSHROOM_SCHEMA_ID,
    previousOperations: viewId.split('_'),
    fields: {
      ...values,
    },
  });

  const entry = signAndEncodeEntry(
    {
      ...args,
      payload: operation,
    },
    keyPair,
  );

  await publish(entry, operation);
}

export async function getAllPictures(): Promise<PictureResponse[]> {
  const query = gql`{
    pictures: all_${PICTURE_SCHEMA_ID} {
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

  const result = await client.request(query);
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

  console.log(values);

  const operation = encodeOperation({
    schemaId: PICTURE_SCHEMA_ID,
    fields,
  });

  const entry = signAndEncodeEntry(
    {
      ...args,
      payload: operation,
    },
    keyPair,
  );

  await publish(entry, operation);
}
