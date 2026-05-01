-- ============================================================================
-- Story entity: narrative container + authoring plan
-- ============================================================================

CREATE TABLE story (
  story_id       INT IDENTITY(1,1) PRIMARY KEY,
  story_ud       NVARCHAR(50)   NOT NULL UNIQUE,
  title          NVARCHAR(300)  NOT NULL,
  description    NVARCHAR(MAX)  NULL,
  status         NVARCHAR(20)   NOT NULL DEFAULT 'draft',
  flow_id        INT            NULL REFERENCES flow(flow_id),
  composition_id INT            NULL REFERENCES composition(composition_id),
  created_at     DATETIME2      DEFAULT SYSUTCDATETIME(),
  updated_at     DATETIME2      DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE story_plan_item (
  plan_item_id   INT IDENTITY(1,1) PRIMARY KEY,
  story_id       INT            NOT NULL REFERENCES story(story_id) ON DELETE CASCADE,
  seq            INT            NOT NULL,
  act            NVARCHAR(100)  NULL,
  title          NVARCHAR(300)  NOT NULL,
  description    NVARCHAR(MAX)  NULL,
  tables_involved NVARCHAR(MAX) NULL,
  status         NVARCHAR(20)   NOT NULL DEFAULT 'pending',
  step_id        INT            NULL REFERENCES step_library(step_id),
  created_at     DATETIME2      DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_story_plan_item_seq UNIQUE (story_id, seq)
);
GO

-- Seed existing stories
INSERT INTO story (story_ud, title, description, status)
VALUES
  ('garcia', 'Garcia Family',
   'Maria Garcia-TRAIN starts at Acme Manufacturing with Verda Health Plan. Follows the full insurance lifecycle: enrollment, PCP assignment, QCAP sync, referral, claim, and payment.',
   'complete'),
  ('miller', 'Miller Family',
   'Tom Miller starts at Pacific Industries with Summit Health Plan. Enrolls with wife Sarah in PPO Silver. PCP Dr. Lisa Chen (GEN prefix), referral to cardiologist Dr. Adams.',
   'authoring');
GO
