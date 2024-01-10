import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { P2pandaContext } from '../P2pandaContext';
import { getMushroom, updateMushroom } from '../requests';
import { Mushroom } from '../types';

export const EditMushroom = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { session } = useContext(P2pandaContext);

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

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setValues((oldValues) => {
      return {
        ...oldValues,
        [name]: name === 'edible' ? !oldValues.edible : value,
      };
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateMushroom(session, viewId, values);
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
