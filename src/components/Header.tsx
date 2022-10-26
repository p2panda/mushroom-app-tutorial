import React from 'react';

import { Navigation } from '.';
import { P2pandaContext } from '../P2pandaContext';

export const Header: React.FC = () => {
  return (
    <header>
      <h1>🐼 🍄</h1>
      <P2pandaContext.Consumer>
        {({ publicKey }) => {
          return <p className="public-key">Hello, {publicKey}!</p>;
        }}
      </P2pandaContext.Consumer>
      <Navigation />
    </header>
  );
};
