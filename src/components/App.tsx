import React from 'react';

import { Header, Main } from './';

type Props = {
  children: JSX.Element;
};

export const App: React.FC<Props> = ({ children }) => {
  return (
    <div className="app">
      <Header />
      <Main>{children}</Main>
    </div>
  );
};
