import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { initWebAssembly, KeyPair } from 'p2panda-js';

import { App } from './App';

const elem = document.createElement('div');
document.body.appendChild(elem);

const root = createRoot(elem);

initWebAssembly().then(() => {
  const privateKey = window.localStorage.getItem('privateKey');

  let keyPair: KeyPair;
  if (privateKey) {
    keyPair = new KeyPair(privateKey);
  } else {
    keyPair = new KeyPair();
    window.localStorage.setItem('privateKey', keyPair.privateKey());
  }

  root.render(
    <BrowserRouter>
      <App keyPair={keyPair} />
    </BrowserRouter>,
  );
});
