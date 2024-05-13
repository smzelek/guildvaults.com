import React from 'react';
import './App.scss';
import { GuildRoster } from './GuildRoster';

export const App = () => {
  return (
    <>
      <span style={{ display: 'none' }}>
        {process.env.COMMIT_HASH}
      </span>
      <header>
        <h1 className="title">Guild Vault Tracker</h1>
      </header>
      <main>
        <GuildRoster guild='full-clear' realm='bleeding-hollow' />
      </main>
    </>
  );
}
