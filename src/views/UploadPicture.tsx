import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { P2pandaContext } from '../P2pandaContext';
import { Picture } from '../types';
import { createPicture, getAllMushrooms } from '../requests';

export const UploadPicture = () => {
  const navigate = useNavigate();
  const { session } = useContext(P2pandaContext);

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
      const result = await getAllMushrooms();
      setItems(result);
      setLoading(false);
    };

    request();
  }, []);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createPicture(session, values);
    window.alert('Uploaded picture!');
    navigate('/pictures');
  };

  const onUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const onPosition = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos: GeolocationPosition) {
      const crd = pos.coords;

      setValues((oldValues) => {
        return {
          ...oldValues,
          lat: crd.latitude,
          lon: crd.longitude,
        };
      });
    }

    function error(err: GeolocationPositionError) {
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
            className="gps"
            name="lat"
            disabled
            value={values.lat}
            onChange={onChange}
          />
          <input
            type="text"
            id="lon"
            className="gps"
            name="lon"
            disabled
            value={values.lon}
            onChange={onChange}
          />
          <button onClick={onPosition}>Get current position</button>
        </fieldset>
        <fieldset>
          <label>Mushrooms</label>
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
