import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { KeyPair } from 'p2panda-js';

import { getMushroom, updateMushroom } from './requests';
import { Mushroom } from './types';

export const EditMushroom = (props: { keyPair: KeyPair }) => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [loading, setLoading] = useState(true);
  const [viewId, setViewId] = useState<string>();
  const [values, setValues] = useState<Mushroom>({
    title: '',
    latin: '',
    edible: false,
    description: '',
  });

  useEffect(() => {
    const request = async () => {
      setLoading(true);
      const result = await getMushroom(documentId);
      setValues(result.fields);
      setViewId(result.meta.viewId);
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
