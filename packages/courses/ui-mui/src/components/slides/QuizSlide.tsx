import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import type { CourseSlide } from '@trn-platform/shared';

export function QuizSlide({ slide }: { slide: CourseSlide }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const options = slide.quiz_options ?? [];
  const correctAnswer = slide.quiz_answer ?? 0;
  const isCorrect = selected === correctAnswer;

  return (
    <Box>
      {slide.title && (
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {slide.title}
        </Typography>
      )}
      <Typography variant="h6" sx={{ mb: 3 }}>
        {slide.quiz_question}
      </Typography>

      <RadioGroup
        value={selected !== null ? String(selected) : ''}
        onChange={(e) => { setSelected(Number(e.target.value)); setSubmitted(false); }}
      >
        {options.map((option, idx) => (
          <FormControlLabel
            key={idx}
            value={String(idx)}
            control={<Radio />}
            label={option}
            disabled={submitted}
            sx={{
              mb: 1,
              p: 1,
              borderRadius: 1,
              border: 1,
              borderColor: submitted
                ? idx === correctAnswer ? 'success.main' : idx === selected ? 'error.main' : 'divider'
                : idx === selected ? 'primary.main' : 'divider',
              bgcolor: submitted && idx === correctAnswer ? 'success.50' : 'transparent',
            }}
          />
        ))}
      </RadioGroup>

      {!submitted && (
        <Button
          variant="contained"
          onClick={() => setSubmitted(true)}
          disabled={selected === null}
          sx={{ mt: 2 }}
        >
          Check Answer
        </Button>
      )}

      {submitted && (
        <Alert severity={isCorrect ? 'success' : 'error'} sx={{ mt: 2 }}>
          {isCorrect ? 'Correct!' : `Incorrect. The answer is: ${options[correctAnswer]}`}
          {slide.quiz_explanation && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {slide.quiz_explanation}
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  );
}
