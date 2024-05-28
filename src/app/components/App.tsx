import React from 'react';
import '../styles/ui.css';
import { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [properties, setProperties] = useState<any>(null);

  useEffect(() => {
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;
      if (message.type === 'selection') {
        setProperties(message.properties);
      } else if (message.type === 'no-selection') {
        setProperties(null);
      }
    };
  }, []);

  const copyToClipboard = () => {
    const json = JSON.stringify(properties, null, 2);
    navigator.clipboard.writeText(json);
    alert('Copied to clipboard!');
  };

  return (
    <div>
      <h2>Component Properties</h2>
      {properties ? (
        <div>
          <pre>{JSON.stringify(properties, null, 2)}</pre>
          <button onClick={copyToClipboard}>Copy to Clipboard</button>
        </div>
      ) : (
        <p>No component selected</p>
      )}
    </div>
  );
};

export default App;
