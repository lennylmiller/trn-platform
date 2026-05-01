import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import { useCompositionEditor } from '@trn-platform/compositions-feature';
import {
  CompositionBlockCard,
  BlockPropertiesPanel,
  AddBlockBar,
  FlowPickerModal,
  CompositionPickerModal,
} from '@trn-platform/compositions-ui-mui';
import type { BlockType } from '@trn-platform/shared';

export default function CompositionEditView() {
  const { compositionId: cidParam } = useParams<{ compositionId: string }>();
  const compositionId = Number(cidParam);
  const navigate = useNavigate();

  const editor = useCompositionEditor({ compositionId });
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [flowPickerOpen, setFlowPickerOpen] = useState(false);
  const [compPickerOpen, setCompPickerOpen] = useState(false);

  const selectedBlock = editor.blocks.find((b) => b.block_id === selectedBlockId) ?? null;

  if (editor.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (editor.isError) {
    return <Alert severity="error" sx={{ m: 3 }}>Failed to load composition: {editor.error?.message}</Alert>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate('/compositions')}>
          Back
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {editor.composition?.title ?? 'Composition'}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          size="small"
          startIcon={<SlideshowIcon />}
          onClick={() => navigate(`/compositions/run/${compositionId}`)}
        >
          Present
        </Button>
      </Stack>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Stack spacing={1}>
            {editor.blocks.map((block) => (
              <CompositionBlockCard
                key={block.block_id}
                block={block}
                onEdit={() => setSelectedBlockId(block.block_id)}
                onRemove={() => editor.removeBlock(block.block_id)}
              />
            ))}
          </Stack>
          <Box sx={{ mt: 2 }}>
            <AddBlockBar
              onAdd={(type: BlockType) =>
                editor.addBlock({ block_type: type, content: '' })
              }
              disabled={editor.isSaving}
            />
          </Box>
        </Box>
        <Box sx={{ width: 360, borderLeft: 1, borderColor: 'divider', overflow: 'auto' }}>
          <BlockPropertiesPanel
            block={selectedBlock}
            onChange={(blockId, updates) => editor.updateBlockProps(blockId, updates)}
            onPickFlow={() => setFlowPickerOpen(true)}
            onPickComposition={() => setCompPickerOpen(true)}
          />
        </Box>
      </Box>
      <FlowPickerModal
        open={flowPickerOpen}
        onClose={() => setFlowPickerOpen(false)}
        onSelect={(flowId: number) => {
          if (selectedBlockId != null) {
            editor.updateBlockProps(selectedBlockId, { flow_id: flowId });
          }
          setFlowPickerOpen(false);
        }}
      />
      <CompositionPickerModal
        open={compPickerOpen}
        onClose={() => setCompPickerOpen(false)}
        onSelect={(refId: number) => {
          if (selectedBlockId != null) {
            editor.updateBlockProps(selectedBlockId, { ref_composition_id: refId });
          }
          setCompPickerOpen(false);
        }}
      />
    </Box>
  );
}
