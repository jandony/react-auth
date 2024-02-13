import React from 'react';
import { socket } from '../../../socket.mjs';

export function ConnectionManager() {
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <>
      <button onClick={ connect } className="bg-green-600 text-white px-4 py-2 m-2 rounded">Connect</button>
      <button onClick={ disconnect } className="bg-red-700 text-white px-4 py-2 m-2 rounded">Disconnect</button>
    </>
  );
}