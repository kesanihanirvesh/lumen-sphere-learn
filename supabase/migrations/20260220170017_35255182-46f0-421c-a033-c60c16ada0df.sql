-- Remove duplicate rows keeping only the latest one per (student_id, topic_id, progress_type)
DELETE FROM public.student_progress
WHERE id NOT IN (
  SELECT DISTINCT ON (student_id, topic_id, progress_type) id
  FROM public.student_progress
  ORDER BY student_id, topic_id, progress_type, updated_at DESC
);

-- Now add the unique constraint
ALTER TABLE public.student_progress 
ADD CONSTRAINT student_progress_student_topic_type_unique 
UNIQUE (student_id, topic_id, progress_type);