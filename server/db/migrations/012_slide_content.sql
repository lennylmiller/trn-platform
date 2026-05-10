-- ============================================================================
-- Add content column to course_slide for document-first authoring
-- ----------------------------------------------------------------------------
-- A slide can now store its content as a markdown string with embedded
-- component tags (<LiveDemo/>, <Quiz/>, <Image/>, etc.) instead of
-- referencing separate block records via course_slide_element.
-- ============================================================================

ALTER TABLE course_slide ADD content NVARCHAR(MAX) NULL;
GO
