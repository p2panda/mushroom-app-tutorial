import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getAllMushrooms } from '../requests';

export const Mushrooms = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const request = async () => {
      setLoading(true);
      const result = await getAllMushrooms();
      setItems(result);
      setLoading(false);
    };

    request();
  }, []);

  return (
    <>
      <h2>Mushrooms</h2>
      <section className="actions">
        <Link to="/mushrooms/new">➕ Add mushroom</Link>
      </section>
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
