import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getAllPictures } from './requests';
import { MushroomResponse } from './types';

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
      <section className="actions">
        <Link to="/upload">➕ Upload new picture</Link>
      </section>
      {loading ? (
        'Loading ..'
      ) : (
        <ul className="feed">
          {items.map(({ fields, meta }) => {
            return (
              <li key={meta.documentId}>
                <img src={`data:${fields.blob}`} width="250" />
                <ul>
                  {fields.mushrooms.map((mushroom: MushroomResponse) => {
                    return (
                      <li key={mushroom.meta.documentId}>
                        <Link to={`/mushrooms/${mushroom.meta.documentId}`}>
                          {mushroom.fields.title}{' '}
                          <em>{mushroom.fields.latin}</em>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};
