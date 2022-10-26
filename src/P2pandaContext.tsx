import React, { useMemo } from 'react';
import { KeyPair, Session } from 'shirokuma';
import { ENDPOINT } from './constants';

const LOCAL_STORAGE_KEY = 'privateKey';

function getKeyPair(): KeyPair {
  const privateKey = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (privateKey) {
    return new KeyPair(privateKey);
  }

  const keyPair = new KeyPair();
  window.localStorage.setItem(LOCAL_STORAGE_KEY, keyPair.privateKey());
  return keyPair;
}

type Context = {
  publicKey: string | null;
  keyPair: KeyPair | null;
  session: Session | null;
};

export const P2pandaContext = React.createContext<Context>({
  publicKey: null,
  keyPair: null,
  session: null,
});

type Props = {
  children: JSX.Element;
};

export const P2pandaProvider: React.FC<Props> = ({ children }) => {
  const state = useMemo(() => {
    const keyPair = getKeyPair();
    const session = new Session(ENDPOINT).setKeyPair(keyPair);

    return {
      keyPair,
      publicKey: keyPair.publicKey(),
      session,
    };
  }, []);

  return (
    <P2pandaContext.Provider value={state}>{children}</P2pandaContext.Provider>
  );
};
