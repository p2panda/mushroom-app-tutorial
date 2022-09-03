import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyPair } from 'p2panda-js';

import { createMushroom} from './requests';
import { Mushroom } from './types';

export const AddMushroom = (props: { keyPair: KeyPair }) => {
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
