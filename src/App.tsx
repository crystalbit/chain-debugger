import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Folder as FolderIcon,
  ChevronLeft as ChevronLeftIcon,
  Description as DescriptionIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { TestCaseViewer } from './components/TestCaseViewer';
import { TestCaseList } from './components/TestCaseList';
import { JsonFile, TestCase, ElectronAPI } from './types';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#61dafb',
    },
    background: {
      default: '#282c34',
      paper: '#363b45',
    },
    error: {
      main: '#ff6b6b',
    }
  },
});

function App() {
  const [selectedDirectory, setSelectedDirectory] = useState<string>();
  const [jsonFiles, setJsonFiles] = useState<JsonFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<JsonFile | null>(null);

  useEffect(() => {
    window.electronAPI.getLastDirectory().then(dir => {
      if (dir) {
        setSelectedDirectory(dir);
        window.electronAPI.listJsonFiles(dir).then(files => {
          setJsonFiles(files);
        });
      }
    });
  }, []);

  const handleSelectDirectory = async () => {
    const dir = await window.electronAPI.selectDirectory();
    if (dir) {
      setSelectedDirectory(dir);
      const files = await window.electronAPI.listJsonFiles(dir);
      setJsonFiles(files);
      setSelectedFile(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {!selectedFile && (
          <>
            <AppBar position="static" elevation={0}>
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Test Cases
                </Typography>
              </Toolbar>
            </AppBar>
            <Container maxWidth="md" sx={{ py: 4 }}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Test Cases
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSelectDirectory}
                >
                  Select Directory
                </Button>
              </Box>

              {selectedDirectory && (
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Selected Directory: {selectedDirectory}
                  </Typography>
                </Paper>
              )}

              <TestCaseList
                files={jsonFiles}
                onSelect={setSelectedFile}
              />
            </Container>
          </>
        )}

        {selectedFile && (
          <TestCaseViewer
            file={selectedFile}
            onBack={() => setSelectedFile(null)}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App; 