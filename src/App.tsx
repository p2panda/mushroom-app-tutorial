import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { KeyPair } from 'p2panda-js';

import './styles.css';

import { AddMushroom } from './AddMushroom';
import { EditMushroom } from './EditMushroom';
import { Mushrooms } from './Mushrooms';
import { Pictures } from './Pictures';
import { ShowMushroom } from './ShowMushroom';
import { UploadPicture } from './UploadPicture';

export const App = (props: { keyPair: KeyPair }) => {
  return (
    <div className="app">
      <header>
        <h1>🐼 🍄</h1>
        <p className="public-key">Hello, {props.keyPair.publicKey()}!</p>
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
    </div>
  );
};
