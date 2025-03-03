import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

const { ipcRenderer } = window.require('electron');

function App() {
  const [selectedDir, setSelectedDir] = useState<string | null>(null);

  const handleSelectDirectory = async () => {
    try {
      const result = await ipcRenderer.invoke('select-directory');
      if (result) {
        setSelectedDir(result);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleSelectDirectory}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#61dafb',
              color: '#282c34',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#4fa8c7')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = '#61dafb')}
          >
            Select Directory
          </button>
          {selectedDir && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: 'rgba(97, 218, 251, 0.1)',
              borderRadius: '5px',
              maxWidth: '80%',
              wordBreak: 'break-all'
            }}>
              Selected: {selectedDir}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App; 