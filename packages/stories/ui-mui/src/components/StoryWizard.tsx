import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import type { Story, PlanItemCreate } from '@trn-platform/shared';
import { STEP_TYPE_COLORS } from '@trn-platform/shared';
import { useCreateStory, useAddPlanItems } from '@trn-platform/stories-data-access';
import { useSteps } from '@trn-platform/steps-data-access';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoryWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (story: Story) => void;
}

interface ActConfig {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_ACTS: ActConfig[] = [
  { key: 'enrollment', label: 'Enrollment', description: 'Client, group, contract, family eligibility, member enrollment', enabled: true },
  { key: 'pcp', label: 'Choose PCP', description: 'Provider creation, PCP assignment to member benefit plan', enabled: true },
  { key: 'qcap', label: 'QCAP Sync', description: 'Assign QCAP result code based on PCP IPA prefix', enabled: true },
  { key: 'referral', label: 'Referral', description: 'Specialist referral with visit limits and date range', enabled: false },
  { key: 'claim', label: 'Visit & Claim', description: 'Claim submission with procedure codes and charges', enabled: false },
  { key: 'payment', label: 'Payment', description: 'Adjudication, payment run, and accounting', enabled: false },
];

const WIZARD_STEPS = ['Story', 'Acts', 'Existing Steps', 'Review'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StoryWizard({ open, onClose, onComplete }: StoryWizardProps) {
  const [activeStep, setActiveStep] = useState(0);

  // Step 1: Story basics
  const [title, setTitle] = useState('');
  const [storyUd, setStoryUd] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Acts
  const [acts, setActs] = useState<ActConfig[]>(DEFAULT_ACTS.map(a => ({ ...a })));

  // Step 3: Existing steps
  const [selectedStepIds, setSelectedStepIds] = useState<Set<number>>(new Set());
  const { data: existingSteps = [] } = useSteps();

  // Mutations
  const createStory = useCreateStory();
  const addPlanItems = useAddPlanItems();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived
  const enabledActs = acts.filter(a => a.enabled);
  const commonSteps = existingSteps.filter(s => !s.story);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!storyUd || storyUd === slugify(title)) {
      setStoryUd(slugify(value));
    }
  };

  const toggleAct = (key: string) => {
    setActs(prev => prev.map(a => a.key === key ? { ...a, enabled: !a.enabled } : a));
  };

  const toggleStep = (stepId: number) => {
    setSelectedStepIds(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const canNext = (): boolean => {
    if (activeStep === 0) return title.trim().length > 0 && storyUd.trim().length > 0;
    if (activeStep === 1) return enabledActs.length > 0;
    return true;
  };

  const handleNext = () => {
    if (activeStep < WIZARD_STEPS.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create the story
      const story = await createStory.mutateAsync({
        story_ud: storyUd.trim().toLowerCase(),
        title: title.trim(),
        description: description.trim() || null,
      });

      // 2. Build plan items from enabled acts + selected existing steps
      const planItems: PlanItemCreate[] = [];
      let seq = 1;

      // Add plan items for each enabled act
      for (const act of enabledActs) {
        planItems.push({
          seq: seq++,
          act: act.label,
          title: `${act.label} step`,
          description: act.description,
        });
      }

      // Add plan items for selected existing steps
      for (const stepId of selectedStepIds) {
        const step = existingSteps.find(s => s.step_id === stepId);
        if (step) {
          planItems.push({
            seq: seq++,
            act: 'Imported',
            title: step.label,
            description: `Imported from existing step #${step.step_id}: ${step.description ?? ''}`.trim(),
          });
        }
      }

      // 3. Add plan items if any
      if (planItems.length > 0) {
        await addPlanItems.mutateAsync({
          storyId: story.story_id,
          items: planItems,
        });
      }

      // 4. Done — reset and notify
      resetForm();
      onComplete?.(story);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setActiveStep(0);
    setTitle('');
    setStoryUd('');
    setDescription('');
    setActs(DEFAULT_ACTS.map(a => ({ ...a })));
    setSelectedStepIds(new Set());
    setError(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            New Story
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 400 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {WIZARD_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Step 1: Story basics */}
        {activeStep === 0 && (
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              Every story starts with a character and a situation. Who is this person,
              and what brings them into the health insurance system?
            </Typography>

            <TextField
              label="Story Title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              fullWidth
              autoFocus
              placeholder="e.g. Johnson Family"
            />

            <TextField
              label="Identifier"
              value={storyUd}
              onChange={(e) => setStoryUd(e.target.value)}
              required
              fullWidth
              size="small"
              helperText="Short lowercase key used to tag steps (auto-generated from title)"
              slotProps={{ input: { sx: { fontFamily: 'monospace' } } }}
            />

            <TextField
              label="The Story"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={4}
              fullWidth
              placeholder="Sarah Johnson starts a new position at River Health Systems. Her employer offers coverage through Cascade Medical Plan. Sarah enrolls herself and her son Marcus in the PPO Bronze tier..."
            />
          </Stack>
        )}

        {/* Step 2: Choose acts */}
        {activeStep === 1 && (
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Which parts of the insurance lifecycle does this story cover?
              Each act becomes a group of plan items to author.
            </Typography>

            {acts.map((act) => (
              <Box
                key={act.key}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: act.enabled ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: act.enabled ? 'primary.50' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
                onClick={() => toggleAct(act.key)}
              >
                <FormControlLabel
                  control={<Checkbox checked={act.enabled} size="small" />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {act.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {act.description}
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </Box>
            ))}
          </Stack>
        )}

        {/* Step 3: Import existing steps */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Optionally include existing common steps in your story plan.
              These are steps not tied to any specific story.
            </Typography>

            {commonSteps.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No common steps available. You can skip this step.
              </Typography>
            ) : (
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {commonSteps.map((step) => (
                  <ListItem
                    key={step.step_id}
                    sx={{
                      border: 1,
                      borderColor: selectedStepIds.has(step.step_id) ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      mb: 0.5,
                      cursor: 'pointer',
                      bgcolor: selectedStepIds.has(step.step_id) ? 'primary.50' : 'transparent',
                    }}
                    onClick={() => toggleStep(step.step_id)}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        checked={selectedStepIds.has(step.step_id)}
                        size="small"
                        edge="start"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={step.label}
                      secondary={step.description}
                      slotProps={{
                        primary: { variant: 'body2', sx: { fontWeight: 600 } },
                        secondary: { variant: 'caption', noWrap: true },
                      }}
                    />
                    <Chip
                      label={step.type}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: STEP_TYPE_COLORS[step.type],
                        color: '#fff',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Step 4: Review */}
        {activeStep === 3 && (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Review your new story before creating it.
            </Typography>

            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {storyUd}
              </Typography>
              {description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {description}
                </Typography>
              )}
            </Box>

            <Divider />

            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Plan ({enabledActs.length} acts + {selectedStepIds.size} imported steps)
            </Typography>

            <Stack spacing={0.5}>
              {enabledActs.map((act) => (
                <Stack key={act.key} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="body2">{act.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {act.description}
                  </Typography>
                </Stack>
              ))}
              {[...selectedStepIds].map((stepId) => {
                const step = existingSteps.find(s => s.step_id === stepId);
                return step ? (
                  <Stack key={stepId} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 16, color: 'info.main' }} />
                    <Typography variant="body2">{step.label}</Typography>
                    <Chip label="imported" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Stack>
                ) : null;
              })}
            </Stack>
          </Stack>
        )}
      </DialogContent>

      {/* Navigation */}
      <Stack
        direction="row"
        sx={{
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || isSubmitting}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>

        {activeStep < WIZARD_STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canNext()}
            endIcon={<ArrowForwardIcon />}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Story'}
          </Button>
        )}
      </Stack>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}
