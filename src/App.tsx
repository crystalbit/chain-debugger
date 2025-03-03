import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

interface JsonFile {
  name: string;
  path: string;
  size: number;
}

interface TestCaseViewerProps {
  file: JsonFile;
  onBack: () => void;
}

function TestCaseViewer({ file, onBack }: TestCaseViewerProps) {
  return (
    <div className="App" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        backgroundColor: '#282c34',
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 15px',
            fontSize: '14px',
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
          Back
        </button>
        <h2 style={{ 
          margin: 0,
          color: '#61dafb',
          fontSize: '1.5em',
          fontWeight: 'normal'
        }}>
          {file.name.replace(/\.json$/, '')}
        </h2>
      </div>
      <div style={{
        flex: 1,
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        overflowY: 'auto'
      }}>
        {/* Content will be added here */}
      </div>
    </div>
  );
}

function App() {
  const [selectedDir, setSelectedDir] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jsonFiles, setJsonFiles] = useState<JsonFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<JsonFile | null>(null);

  useEffect(() => {
    const loadLastDirectory = async () => {
      try {
        const lastDir = await window.electronAPI.getLastDirectory();
        if (lastDir) {
          setSelectedDir(lastDir);
          const files = await window.electronAPI.listJsonFiles(lastDir);
          setJsonFiles(files);
        }
      } catch (error) {
        console.error('Error loading last directory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLastDirectory();
  }, []);

  const handleSelectDirectory = async () => {
    try {
      const result = await window.electronAPI.selectDirectory();
      if (result) {
        setSelectedDir(result);
        const files = await window.electronAPI.listJsonFiles(result);
        setJsonFiles(files);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatFileName = (name: string): string => {
    return name.replace(/\.json$/, '');
  };

  if (selectedFile) {
    return <TestCaseViewer file={selectedFile} onBack={() => setSelectedFile(null)} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '800px' }}>
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
            {isLoading ? 'Loading...' : 'Select Directory'}
          </button>
          {selectedDir && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: 'rgba(97, 218, 251, 0.1)',
              borderRadius: '5px',
              width: '100%',
              wordBreak: 'break-all'
            }}>
              Selected: {selectedDir}
            </div>
          )}
          {jsonFiles.length > 0 && (
            <div style={{
              marginTop: '20px',
              width: '100%',
              backgroundColor: 'rgba(97, 218, 251, 0.1)',
              borderRadius: '5px',
              padding: '15px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#61dafb' }}>Test Cases:</h3>
              <div style={{
                display: 'grid',
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '5px'
              }}>
                {jsonFiles.map((file) => (
                  <div
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(97, 218, 251, 0.3)')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = 'rgba(97, 218, 251, 0.2)')}
                    style={{
                      backgroundColor: 'rgba(97, 218, 251, 0.2)',
                      padding: '10px',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {formatFileName(file.name)}
                    </span>
                    <span style={{ color: '#61dafb', marginLeft: '10px' }}>
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedDir && jsonFiles.length === 0 && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: 'rgba(97, 218, 251, 0.1)',
              borderRadius: '5px',
              color: '#666'
            }}>
              No test cases found in this directory
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App; 