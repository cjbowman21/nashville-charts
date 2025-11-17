-- Migration: Add Feedbacks table for user feedback system
-- Created: 2025-10-24
-- Description: Creates the Feedbacks table with proper indexes and foreign key constraints

-- Create Feedbacks table
CREATE TABLE IF NOT EXISTS "Feedbacks" (
    "Id" uuid NOT NULL,
    "UserId" text NOT NULL,
    "Type" character varying(20) NOT NULL,
    "Title" character varying(200) NOT NULL,
    "Description" character varying(5000) NOT NULL,
    "Priority" character varying(20) NOT NULL DEFAULT 'Medium',
    "Status" character varying(50) NOT NULL DEFAULT 'New',
    "CreatedAt" timestamp without time zone NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    "UpdatedAt" timestamp without time zone NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    CONSTRAINT "PK_Feedbacks" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Feedbacks_AspNetUsers_UserId" FOREIGN KEY ("UserId")
        REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "IX_Feedbacks_UserId" ON "Feedbacks" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_Feedbacks_Type" ON "Feedbacks" ("Type");
CREATE INDEX IF NOT EXISTS "IX_Feedbacks_Status" ON "Feedbacks" ("Status");
CREATE INDEX IF NOT EXISTS "IX_Feedbacks_CreatedAt" ON "Feedbacks" ("CreatedAt");

-- Verify table creation
SELECT 'Feedbacks table created successfully' AS result;
