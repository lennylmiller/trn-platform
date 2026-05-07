import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import SendIcon from '@mui/icons-material/Send';

import { submitFeedback, type FeedbackSubmission, type SubmitFeedbackInput } from '../capture';

const CATEGORIES: Array<NonNullable<SubmitFeedbackInput['category']>> = ['bug', 'design', 'course', 'other'];

export default function CaptureDemoPage() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<NonNullable<SubmitFeedbackInput['category']>>('design');
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [result, setResult] = useState<FeedbackSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const nextResult = await submitFeedback({
        message,
        email,
        category,
        includeScreenshot,
      });
      setResult(nextResult);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feedback submission failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
      <Paper sx={{ maxWidth: 760, mx: 'auto', p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={1.5} sx={{ mb: 1, alignItems: 'center' }}>
              <BugReportIcon color="primary" />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Feedback Capture
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              Submit a low-friction feedback bundle with app screenshot, route, viewport, browser details, and recent actions.
            </Typography>
          </Box>

          <TextField
            label="What should we look at?"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            multiline
            minRows={5}
            required
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value as NonNullable<SubmitFeedbackInput['category']>)}
              sx={{ minWidth: 180 }}
            >
              {CATEGORIES.map((nextCategory) => (
                <MenuItem key={nextCategory} value={nextCategory}>
                  {nextCategory}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="optional"
              fullWidth
            />
          </Stack>

          <FormControlLabel
            control={
              <Checkbox
                checked={includeScreenshot}
                onChange={(event) => setIncludeScreenshot(event.target.checked)}
              />
            }
            label="Include app screenshot"
          />

          <Box>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              disabled={busy || message.trim().length < 4}
              onClick={() => void submit()}
            >
              {busy ? 'Submitting...' : 'Send Feedback'}
            </Button>
          </Box>

          {result && (
            <Alert severity="success">
              Feedback saved as {result.id}. Screenshot saved: {result.screenshotSaved ? 'yes' : 'no'}.
            </Alert>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </Paper>
    </Box>
  );
}
