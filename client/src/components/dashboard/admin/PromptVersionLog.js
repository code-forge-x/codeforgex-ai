import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton
} from '@mui/material';
import CompareIcon from '@mui/icons-material/Compare';
import axios from 'axios';
import { diffLines } from 'diff';
import API_URL from '../../../api';

export default function PromptVersionLog() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState({ old: null, new: null });
  const [diffResult, setDiffResult] = useState(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/prompts/1/versions`); // Placeholder ID
        setVersions(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch versions');
      } finally {
        setLoading(false);
      }
    };
    fetchVersions();
  }, []);

  const handleCompare = (oldVersion, newVersion) => {
    setSelectedVersions({ old: oldVersion, new: newVersion });
    const diff = diffLines(oldVersion.content, newVersion.content);
    setDiffResult(diff);
    setCompareDialogOpen(true);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (versions.length === 0) return <Typography>No version history available.</Typography>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Version History
      </Typography>
      <Paper>
        <List>
          {versions.map((version, index) => (
            <React.Fragment key={version.version}>
              <ListItem
                secondaryAction={
                  index > 0 && (
                    <IconButton
                      edge="end"
                      onClick={() => handleCompare(versions[index - 1], version)}
                    >
                      <CompareIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={`Version ${version.version}`}
                  secondary={`${version.changes} - ${version.timestamp}`}
                />
              </ListItem>
              {index < versions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Compare Versions {selectedVersions.old?.version} and {selectedVersions.new?.version}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {diffResult?.map((part, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: part.added ? '#e6ffe6' : part.removed ? '#ffe6e6' : 'transparent',
                  p: 1,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {part.value}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 