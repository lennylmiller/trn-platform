-- ============================================================================
-- Course tracks: audience/purpose grouping above series
-- ----------------------------------------------------------------------------
-- Tracks group series and standalone courses by audience or purpose
-- (e.g., "New User Onboarding", "Operations", "Troubleshooting").
-- Hierarchy: track -> series -> course -> lesson -> slide
-- ============================================================================

CREATE TABLE course_track (
  track_id       INT IDENTITY(1,1) PRIMARY KEY,
  title          NVARCHAR(300)  NOT NULL,
  description    NVARCHAR(MAX)  NULL,
  seq            INT            NOT NULL DEFAULT 0,
  created_at     DATETIME2      DEFAULT SYSUTCDATETIME()
);
GO

-- Series can belong to a track
ALTER TABLE course_series ADD
  track_id       INT            NULL REFERENCES course_track(track_id),
  track_seq      INT            NULL;
GO

-- Standalone courses (no series) can belong to a track directly
ALTER TABLE course ADD
  track_id       INT            NULL REFERENCES course_track(track_id),
  track_seq      INT            NULL;
GO
