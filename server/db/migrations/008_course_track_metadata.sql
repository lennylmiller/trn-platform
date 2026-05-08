-- ============================================================================
-- Add metadata JSON column to course_track
-- ----------------------------------------------------------------------------
-- Extensible properties placeholder for future capture-mcp integration
-- (capture folder paths, naming conventions, styling, etc.)
-- ============================================================================

ALTER TABLE course_track ADD
  metadata NVARCHAR(MAX) NULL;
GO
