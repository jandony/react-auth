import React from 'react';

export function ConnectionState({ isConnected }) {
  return <p>Status: {isConnected ? "You're Online!" : "Offline"}</p>;
}