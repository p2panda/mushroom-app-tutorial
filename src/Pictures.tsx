import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getAllPictures } from './requests';

export const Pictures = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const request = async () => {
      setLoading(true);
      const result = await getAllPictures();
      setItems(result);
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
