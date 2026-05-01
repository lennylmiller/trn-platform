-- ============================================================================
-- Add story column to step_library for grouping steps by narrative
-- ============================================================================

ALTER TABLE step_library ADD story NVARCHAR(50) NULL;
GO

-- Filtered index for story queries
CREATE NONCLUSTERED INDEX IX_step_library_story
ON step_library (story)
WHERE story IS NOT NULL;
GO

-- Tag existing Garcia-specific steps
-- Steps 36-56 are the Garcia family walkthrough steps (seeded by qc-train.sh init)
UPDATE step_library SET story = 'garcia'
WHERE step_id IN (36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56);
GO
