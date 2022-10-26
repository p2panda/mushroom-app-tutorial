import { GraphQLClient, gql, RequestDocument } from 'graphql-request';
import { Session } from 'shirokuma';

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
  session: Session,
  values: Mushroom,
): Promise<void> {
  await session.create(values, { schema: MUSHROOM_SCHEMA_ID });
}

export async function updateMushroom(
  session: Session,
  previous: string,
  values: Mushroom,
): Promise<void> {
  await session.update(values, previous.split('_'), {
    schema: MUSHROOM_SCHEMA_ID,
  });
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

export async function createPicture(session: Session, values: Picture) {
  await session.create(values, { schema: FINDINGS_SCHEMA_ID });
}
