-- ============================================================================
-- Rename course_section -> course_lesson and section_id -> lesson_id
-- ----------------------------------------------------------------------------
-- "Lesson" matches the user-facing vocabulary; the underlying hierarchy stays
-- course -> lesson -> slide. Foreign keys retain their auto-generated names
-- (cosmetic, not load-bearing).
-- ============================================================================

EXEC sp_rename 'UQ_course_section_seq', 'UQ_course_lesson_seq', 'OBJECT';
GO

EXEC sp_rename 'course_section.section_id', 'lesson_id', 'COLUMN';
GO

EXEC sp_rename 'course_slide.section_id', 'lesson_id', 'COLUMN';
GO

EXEC sp_rename 'course_section', 'course_lesson';
GO
