import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BoltIcon from '@mui/icons-material/Bolt';
import type { CourseBlock } from '@trn-platform/shared';
import { MarkdownBlock } from '../MarkdownBlock';
import { useSlideVerify } from '@trn-platform/courses-feature';
import { useExecuteSql } from '@trn-platform/courses-data-access';

export function DoItInQcBlock({ slide }: { slide: CourseBlock }) {
  const { verify, result, isPending } = useSlideVerify();
  const executeSql = useExecuteSql();
  const [seeded, setSeeded] = useState(false);

  const handleSeed = () => {
    if (!slide.seed_sql) return;
    executeSql.mutate(slide.seed_sql, {
      onSuccess: () => setSeeded(true),
    });
  };

  return (
    <Box>
      {slide.title && (
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {slide.title}
        </Typography>
      )}
      {slide.content && <MarkdownBlock content={slide.content} interactive={false} />}

      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 3, justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}
      >
        {/* Check My Work button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          onClick={() => verify(slide)}
          disabled={isPending || !slide.sql_text}
        >
          Check My Work
        </Button>

        {/* Seed button — only shows when seed_sql exists */}
        {slide.seed_sql && (
          <>
            <Divider orientation="vertical" flexItem />
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={executeSql.isPending ? <CircularProgress size={20} color="inherit" /> : <BoltIcon />}
              onClick={handleSeed}
              disabled={executeSql.isPending || seeded}
            >
              {seeded ? 'Seeded' : (slide.seed_label ?? 'Seed It For Me')}
            </Button>
          </>
        )}
      </Stack>

      {/* Seed success */}
      {seeded && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Data seeded. Click **Check My Work** to verify.
        </Alert>
      )}

      {/* Seed error */}
      {executeSql.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Seed failed: {executeSql.error.message}
        </Alert>
      )}

      {/* Verification result */}
      {result && (
        <Alert severity={result.passed ? 'success' : 'error'} sx={{ mt: 2 }}>
          {result.message}
        </Alert>
      )}
    </Box>
  );
}
