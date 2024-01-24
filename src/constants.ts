import schemas from '../schemas.json';

// Run `npm run schema` and paste the resulting schema ids into `schemas.json`
export const MUSHROOM_SCHEMA_ID = schemas.MUSHROOM_SCHEMA_ID;
export const FINDINGS_SCHEMA_ID = schemas.FINDINGS_SCHEMA_ID;

// URL of your local aquadoggo node
export const ENDPOINT = 'http://localhost:2020/graphql';

// URL of blobs HTTP endpoint
export const BLOB_ENDPOINT = 'http://localhost:2020/blobs';
