-- Add unique constraint to prevent multiple attempts per student per quiz
-- This will prevent students from taking the same assessment multiple times
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_attempts_unique 
ON quiz_attempts (student_id, quiz_id) 
WHERE status IN ('completed', 'in_progress');

-- Add created_at column if it doesn't exist (fallback to started_at)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='quiz_attempts' AND column_name='created_at') THEN
        ALTER TABLE quiz_attempts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        -- Update existing records to use started_at as created_at
        UPDATE quiz_attempts SET created_at = started_at WHERE created_at IS NULL;
    END IF;
END $$;