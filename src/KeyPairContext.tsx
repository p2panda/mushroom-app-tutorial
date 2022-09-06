import React, { useMemo } from 'react';
import { KeyPair } from 'p2panda-js';

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
};

export const KeyPairContext = React.createContext<Context>({
  publicKey: null,
  keyPair: null,
});

type Props = {
  children: JSX.Element;
};

export const KeyPairProvider: React.FC<Props> = ({ children }) => {
  const state = useMemo(() => {
    const keyPair = getKeyPair();

    return {
      keyPair,
      publicKey: keyPair.publicKey(),
    };
  }, []);

  return (
    <KeyPairContext.Provider value={state}>{children}</KeyPairContext.Provider>
  );
};
