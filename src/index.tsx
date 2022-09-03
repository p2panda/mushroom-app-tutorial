import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { GraphQLClient, gql } from 'graphql-request';
import { createRoot } from 'react-dom/client';
import {
  initWebAssembly,
  KeyPair,
  encodeOperation,
  signAndEncodeEntry,
  OperationFields,
} from 'p2panda-js';

const MUSHROOM_SCHEMA_ID =
  'mushroom_0020001e7180ed588e84191aedc05b08008191119eed4df21d442919874a631e8644';
const PICTURE_SCHEMA_ID =
  'mushroom_picture_002029ae052579df593d474e8cabdeb88e78b4994ff35814307e260ecda8a132b8b6';

const client = new GraphQLClient('http://localhost:2020/graphql');

type NextArgs = {
  logId: string;
  seqNum: string;
  backlink?: string;
  skiplink?: string;
};

type Mushroom = {
  title: string;
  description: string;
  latin: string;
  edible: boolean;
};

type Picture = {
  blob: string;
  lat: number;
  lon: number;
  mushrooms: string[];
};

async function nextArgs(publicKey: string, viewId?: string): Promise<NextArgs> {
  const GQL_NEXT_ARGS = gql`
    query NextArgs($publicKey: String!, $viewId: String) {
      nextArgs(publicKey: $publicKey, viewId: $viewId) {
        logId
        seqNum
        backlink
        skiplink
      }
    }
  `;

  const result = await client.request(GQL_NEXT_ARGS, {
    publicKey,
    viewId,
  });

  return result.nextArgs;
}

export async function publish(
  entry: string,
  operation: string,
): Promise<NextArgs> {
  const GQL_PUBLISH = gql`
    mutation Publish($entry: String!, $operation: String!) {
      publish(entry: $entry, operation: $operation) {
        logId
        seqNum
        backlink
        skiplink
      }
    }
  `;

  const result = await client.request(GQL_PUBLISH, {
    entry,
    operation,
  });

  return result.publish;
}

async function createMushroom(keyPair: KeyPair, values: Mushroom) {
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

async function updateMushroom(
  keyPair: KeyPair,
  viewId: string,
  values: Mushroom,
) {
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

async function createPicture(keyPair: KeyPair, values: Picture) {
  const args = await nextArgs(keyPair.publicKey());
  const { blob, lat, lon, mushrooms } = values;

  const fields = new OperationFields({
    blob,
    lat,
    lon,
  });
  fields.insert('mushrooms', 'relation_list', mushrooms);

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

const Home = () => {
  return <h2>Welcome!</h2>;
};

const UploadPicture = (props: { keyPair: KeyPair }) => {
  const navigate = useNavigate();

  const [values, setValues] = useState<Picture>({
    blob: '',
    lat: 0,
    lon: 0,
    mushrooms: [],
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const request = async () => {
      setLoading(true);

      const query = gql`{
        mushrooms: all_${MUSHROOM_SCHEMA_ID} {
          meta {
            documentId
          }
          fields {
            title
            latin
          }
        }
      }`;

      const result = await client.request(query);

      setItems(result.mushrooms);
      setLoading(false);
    };

    request();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;

    setValues((oldValues) => {
      if (name === 'mushrooms[]') {
        const mushrooms = [...oldValues.mushrooms];

        if (values.mushrooms.includes(value)) {
          const index = mushrooms.indexOf(value);
          mushrooms.splice(index, 1);
        } else {
          mushrooms.push(value);
        }

        return {
          ...oldValues,
          mushrooms,
        };
      }

      return {
        ...oldValues,
        [name]: value,
      };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await createPicture(props.keyPair, values);
    window.alert('Uploaded picture!');
    navigate('/pictures');
  };

  const onUpload = (event) => {
    const { files } = event.target;

    if (!files || !files[0]) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener('load', function (evt) {
      setValues((oldValues) => {
        return {
          ...oldValues,
          blob: evt.target.result as unknown as string,
        };
      });
    });

    reader.readAsDataURL(files[0]);
  };

  const onPosition = (event) => {
    event.preventDefault();

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos) {
      const crd = pos.coords;

      setValues((oldValues) => {
        return {
          ...oldValues,
          lat: crd.latitude,
          lon: crd.longitude,
        };
      });
    }

    function error(err) {
      window.alert(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
  };

  const disabled =
    !values.blob || !values.lat || !values.lon || values.mushrooms.length === 0;

  return (
    <>
      <h2>Upload Picture</h2>
      <form onSubmit={onSubmit}>
        <fieldset>
          <label htmlFor="blob">Image</label>
          {values.blob && <img src={`data:${values.blob}`} width="150" />}
          <input id="blob" type="file" onChange={onUpload} />
        </fieldset>
        <fieldset>
          <label htmlFor="lat">GPS Position</label>
          <input
            type="text"
            id="lat"
            name="lat"
            value={values.lat}
            onChange={onChange}
          />
          <input
            type="text"
            id="lon"
            name="lon"
            value={values.lon}
            onChange={onChange}
          />
          <button onClick={onPosition}>Get current position</button>
        </fieldset>
        <fieldset>
          <ul>
            {loading
              ? 'Loading ...'
              : items.map((item) => {
                  const documentId = item.meta.documentId;

                  return (
                    <li key={documentId}>
                      <label htmlFor={documentId}>
                        <input
                          type="checkbox"
                          name="mushrooms[]"
                          onChange={onChange}
                          id={documentId}
                          value={documentId}
                          checked={values.mushrooms.includes(documentId)}
                        />
                        <span>{item.fields.title}</span>
                      </label>
                    </li>
                  );
                })}
          </ul>
        </fieldset>
        <input type="submit" value="Upload" disabled={disabled} />
      </form>
    </>
  );
};

const AddMushroom = (props: { keyPair: KeyPair }) => {
  const navigate = useNavigate();

  const [values, setValues] = useState<Mushroom>({
    title: '',
    latin: '',
    edible: false,
    description: '',
  });

  const onChange = (event) => {
    const { name, value } = event.target;

    setValues((oldValues) => {
      return {
        ...oldValues,
        [name]: name === 'edible' ? !oldValues.edible : value,
      };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await createMushroom(props.keyPair, values);
    window.alert('Created mushroom!');
    navigate('/mushrooms');
  };

  const disabled = !values.title || !values.latin || !values.description;

  return (
    <>
      <h2>Add Mushroom</h2>
      <form onSubmit={onSubmit}>
        <fieldset>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={values.title}
            onChange={onChange}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="latin">Latin name</label>
          <input
            type="text"
            id="latin"
            name="latin"
            value={values.latin}
            onChange={onChange}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="edible">Is it edible?</label>
          <input
            type="checkbox"
            id="edible"
            name="edible"
            checked={values.edible}
            onChange={onChange}
          />
        </fieldset>
        <fieldset>
          <label htmlFor="description">Description</label>
          <textarea
            id="latin"
            name="description"
            value={values.description}
            onChange={onChange}
          ></textarea>
        </fieldset>
        <input type="submit" value="Add" disabled={disabled} />
      </form>
    </>
  );
};

const ShowMushroom = () => {
  const { documentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Mushroom>({
    title: '',
    latin: '',
    edible: false,
    description: '',
  });

  useEffect(() => {
    const request = async () => {
      setLoading(true);

      const query = gql`{
        mushroom: ${MUSHROOM_SCHEMA_ID}(id: "${documentId}") {
          meta {
            viewId
          }
          fields {
            title
            latin
            edible
            description
          }
        }
      }`;

      const result = await client.request(query);

      setValues(result.mushroom.fields);
      setLoading(false);
    };

    request();
  }, [documentId]);

  return (
    <>
      {loading ? (
        'Loading ...'
      ) : (
        <>
          <h2>{values.title}</h2>
          <p>
            <strong>Latin name:</strong> {values.latin}
          </p>
          <p>
            <strong>Is it edible?:</strong> {values.edible ? 'Yes' : 'No!'}
          </p>
          <p>
            <strong>Description:</strong> {values.description}
          </p>
          <Link to={`/mushrooms/${documentId}/edit`}>Edit</Link>
        </>
      )}
    </>
  );
};

const EditMushroom = (props: { keyPair: KeyPair }) => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState();
  const [values, setValues] = useState<Mushroom>({
    title: '',
    latin: '',
    edible: false,
    description: '',
  });

  useEffect(() => {
    const request = async () => {
      setLoading(true);

      const query = gql`{
        mushroom: ${MUSHROOM_SCHEMA_ID}(id: "${documentId}") {
          meta {
            viewId
          }
          fields {
            title
            latin
            edible
            description
          }
        }
      }`;

      const result = await client.request(query);

      setValues(result.mushroom.fields);
      setViewId(result.mushroom.meta.viewId);
      setLoading(false);
    };

    request();
  }, [documentId]);

  const onChange = (event) => {
    const { name, value } = event.target;

    setValues((oldValues) => {
      return {
        ...oldValues,
        [name]: name === 'edible' ? !oldValues.edible : value,
      };
    });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await updateMushroom(props.keyPair, viewId, values);
    window.alert('Updated mushroom!');
    navigate('/mushrooms');
  };

  const disabled = !values.title || !values.latin || !values.description;

  return (
    <>
      <h2>Edit Mushroom</h2>
      {loading ? (
        'Loading ...'
      ) : (
        <form onSubmit={onSubmit}>
          <fieldset>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={values.title}
              onChange={onChange}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="latin">Latin name</label>
            <input
              type="text"
              id="latin"
              name="latin"
              value={values.latin}
              onChange={onChange}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="edible">Is it edible?</label>
            <input
              type="checkbox"
              id="edible"
              name="edible"
              checked={values.edible}
              onChange={onChange}
            />
          </fieldset>
          <fieldset>
            <label htmlFor="description">Description</label>
            <textarea
              id="latin"
              name="description"
              value={values.description}
              onChange={onChange}
            ></textarea>
          </fieldset>
          <input type="submit" value="Update" disabled={disabled} />
        </form>
      )}
    </>
  );
};

const Mushrooms = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const request = async () => {
      setLoading(true);

      const query = gql`{
        mushrooms: all_${MUSHROOM_SCHEMA_ID} {
          meta {
            documentId
          }
          fields {
            title
            latin
          }
        }
      }`;

      const result = await client.request(query);

      setItems(result.mushrooms);
      setLoading(false);
    };

    request();
  }, []);

  return (
    <>
      <h2>Mushrooms</h2>
      <Link to="/mushrooms/new">➕ Add mushroom</Link>
      {loading ? (
        'Loading ..'
      ) : (
        <ul>
          {items.map(({ fields, meta }) => {
            return (
              <li key={meta.documentId}>
                <Link to={`/mushrooms/${meta.documentId}`}>
                  {fields.title} <em>({fields.latin})</em>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

const Pictures = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const request = async () => {
      setLoading(true);

      const query = gql`{
        pictures: all_${PICTURE_SCHEMA_ID} {
          meta {
            documentId
          }
          fields {
            blob
            mushrooms {
              meta {
                documentId
              }
              fields {
                title
                latin
              }
            }
          }
        }
      }`;

      const result = await client.request(query);

      setItems(result.pictures);
      setLoading(false);
    };

    request();
  }, []);

  return (
    <>
      <h2>Feed</h2>
      <Link to="/upload">➕ Upload new picture</Link>
      {loading ? (
        'Loading ..'
      ) : (
        <ul>
          {items.map(({ fields, meta }) => {
            return (
              <li key={meta.documentId}>
                <img src={`data:${fields.blob}`} width="250" />
                <p>
                  {fields.mushrooms.map((mushroom) => {
                    return (
                      <Link to={`/mushrooms/${mushroom.meta.documentId}`}>
                        {mushroom.fields.title} <em>{mushroom.fields.latin}</em>
                      </Link>
                    );
                  })}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

const App = (props: { keyPair: KeyPair }) => {
  return (
    <>
      <header>
        <h1>🐼 🍄</h1>
        <p>Hello, {props.keyPair.publicKey()}!</p>
        <nav>
          <ul>
            <li>
              <Link to="/">Feed</Link>
            </li>
            <li>
              <Link to="/mushrooms">Mushrooms</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Pictures />} />
          <Route
            path="/upload"
            element={<UploadPicture keyPair={props.keyPair} />}
          />
          <Route path="/mushrooms" element={<Mushrooms />} />
          <Route
            path="/mushrooms/new"
            element={<AddMushroom keyPair={props.keyPair} />}
          />
          <Route path="/mushrooms/:documentId" element={<ShowMushroom />} />
          <Route
            path="/mushrooms/:documentId/edit"
            element={<EditMushroom keyPair={props.keyPair} />}
          />
        </Routes>
      </main>
    </>
  );
};

const elem = document.createElement('div');
document.body.appendChild(elem);

const root = createRoot(elem);

initWebAssembly().then(() => {
  const privateKey = window.localStorage.getItem('privateKey');

  let keyPair: KeyPair;
  if (privateKey) {
    keyPair = new KeyPair(privateKey);
  } else {
    keyPair = new KeyPair();
    window.localStorage.setItem('privateKey', keyPair.privateKey());
  }

  root.render(
    <BrowserRouter>
      <App keyPair={keyPair} />
    </BrowserRouter>,
  );
});
