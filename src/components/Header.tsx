import React from 'react';

import { Navigation } from '.';
import { KeyPairContext } from '../KeyPairContext';

export const Header: React.FC = () => {
  return (
    <header>
      <h1>🐼 🍄</h1>
      <KeyPairContext.Consumer>
        {({ publicKey }) => {
          return <p className="public-key">Hello, {publicKey}!</p>;
        }}
      </KeyPairContext.Consumer>
      <Navigation />
    </header>
  );
};
