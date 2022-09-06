import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { KeyPairContext } from '../KeyPairContext';
import { Mushroom } from '../types';
import { createMushroom } from '../requests';

export const AddMushroom = () => {
  const navigate = useNavigate();
  const { keyPair } = useContext(KeyPairContext);

  const [values, setValues] = useState<Mushroom>({
    title: '',
    latin: '',
    edible: false,
    description: '',
  });

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
    await createMushroom(keyPair, values);
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
          />
        </fieldset>
        <input type="submit" value="Add" disabled={disabled} />
      </form>
    </>
  );
};
