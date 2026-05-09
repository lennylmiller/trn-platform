-- ============================================================================
-- Rename course_slide -> course_block and slide_id -> block_id
-- ----------------------------------------------------------------------------
-- "Block" reflects the actual function: a unit of content (narrative, quiz,
-- SQL demo, etc.) within a lesson. The visual "slide" will become a future
-- container layer that composes blocks + images.
-- ============================================================================

EXEC sp_rename 'UQ_course_slide_seq', 'UQ_course_block_seq', 'OBJECT';
GO

EXEC sp_rename 'course_slide.slide_id', 'block_id', 'COLUMN';
GO

EXEC sp_rename 'course_slide.slide_type', 'block_type', 'COLUMN';
GO

EXEC sp_rename 'course_slide', 'course_block';
GO
