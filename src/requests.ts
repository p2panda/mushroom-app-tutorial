import { GraphQLClient, gql, RequestDocument } from 'graphql-request';
import { OperationFields, Session } from 'shirokuma';

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
      documents {
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
  }`;

  const result = await request(query);
  return result.mushrooms.documents;
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
  await session.create(values, { schemaId: MUSHROOM_SCHEMA_ID });
}

export async function updateMushroom(
  session: Session,
  previous: string,
  values: Mushroom,
): Promise<void> {
  await session.update(values, previous.split('_'), {
    schemaId: MUSHROOM_SCHEMA_ID,
  });
}

export async function getAllPictures(): Promise<PictureResponse[]> {
  const query = gql`{
    pictures: all_${FINDINGS_SCHEMA_ID} {
      documents {
        meta {
          documentId
          viewId,
        }
        fields {
          blob
          lat
          lon
          mushrooms {
            documents {
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
      }
    }
  }`;

  const result = await request(query);
  return result.pictures.documents;
}

export async function createPicture(session: Session, values: Picture) {
  const easy_values = {
    lat: values.lat,
    lon: values.lon,
  };
  const operation_fields = new OperationFields(easy_values);
  operation_fields.insert('blob', 'str', values.blob);
  operation_fields.insert('mushrooms', 'relation_list', values.mushrooms);
  await session.create(operation_fields, { schemaId: FINDINGS_SCHEMA_ID });
}
