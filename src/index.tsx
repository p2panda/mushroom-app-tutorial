import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

import './styles.css';

import { App, InitWasm } from './components';
import { P2pandaProvider } from './P2pandaContext';
import { Router } from './Router';

const Root: React.FC = () => {
  return (
    <InitWasm>
      <BrowserRouter>
        <P2pandaProvider>
          <App>
            <Router />
          </App>
        </P2pandaProvider>
      </BrowserRouter>
    </InitWasm>
  );
};

const elem = document.createElement('div');
document.body.appendChild(elem);

const root = createRoot(elem);
root.render(<Root />);
