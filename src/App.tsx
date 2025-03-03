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
  CircularProgress
} from '@mui/material';
import {
  Folder as FolderIcon,
  ChevronLeft as ChevronLeftIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

interface JsonFile {
  name: string;
  path: string;
  size: number;
}

interface TestCaseViewerProps {
  file: JsonFile;
  onBack: () => void;
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
  },
});

function TestCaseViewer({ file, onBack }: TestCaseViewerProps) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            {file.name.replace(/\.json$/, '')}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          {/* Content will be added here */}
        </Paper>
      </Box>
    </Box>
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

  if (selectedFile) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TestCaseViewer file={selectedFile} onBack={() => setSelectedFile(null)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Test Cases
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Button
              variant="contained"
              startIcon={<FolderIcon />}
              onClick={handleSelectDirectory}
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Loading...' : 'Select Directory'}
            </Button>

            {selectedDir && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  Selected: {selectedDir}
                </Typography>
              </Box>
            )}

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : jsonFiles.length > 0 ? (
              <List sx={{ mt: 2 }}>
                {jsonFiles.map((file, index) => (
                  <React.Fragment key={file.path}>
                    {index > 0 && <Divider />}
                    <ListItem
                      onClick={() => setSelectedFile(file)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(97, 218, 251, 0.08)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={file.name.replace(/\.json$/, '')}
                        primaryTypographyProps={{
                          sx: { color: 'primary.main' }
                        }}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="body2" color="textSecondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : selectedDir && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="textSecondary">
                  No test cases found in this directory
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 