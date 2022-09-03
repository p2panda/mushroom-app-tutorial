import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getMushroom } from './requests';
import { Mushroom } from './types';

export const ShowMushroom = () => {
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
      const result = await getMushroom(documentId);
      setValues(result.fields);
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
