import { useState, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export interface ImageUploadZoneProps {
  /** Current image URL (if set) */
  currentUrl?: string | null;
  /** Called with the uploaded image URL */
  onUpload: (url: string) => void;
  /** Height of the zone */
  height?: number;
}

export function ImageUploadZone({ currentUrl, onUpload, height = 120 }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/v2/uploads', { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onUpload(data.url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      void uploadFile(file);
    }
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  }, [uploadFile]);

  if (currentUrl) {
    return (
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={currentUrl}
          alt="Uploaded image"
          sx={{ maxWidth: '100%', maxHeight: height * 2, borderRadius: 1, border: 1, borderColor: 'divider' }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.5, cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          Click to replace
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileSelect}
        />
      </Box>
    );
  }

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      sx={{
        height,
        border: 2,
        borderStyle: 'dashed',
        borderColor: isDragging ? 'primary.main' : 'divider',
        borderRadius: 1,
        bgcolor: isDragging ? 'primary.50' : 'action.hover',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s',
        '&:hover': { borderColor: 'primary.light', bgcolor: 'primary.50' },
      }}
    >
      {isUploading ? (
        <CircularProgress size={24} />
      ) : (
        <>
          <CloudUploadIcon sx={{ fontSize: 28, color: 'text.secondary', mb: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            Drop image or click to upload
          </Typography>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileSelect}
      />
    </Box>
  );
}
