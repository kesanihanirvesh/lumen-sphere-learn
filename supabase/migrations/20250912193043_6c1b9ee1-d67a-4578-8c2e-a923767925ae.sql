-- Add Google Drive practice questions as learning material and set up admin access

-- First, let's add the Google Drive practice questions as a learning material
-- We'll associate it with the first available topic (this will make it appear in Practice tab)
INSERT INTO public.learning_materials (
  topic_id, 
  title, 
  description, 
  material_type, 
  learning_style, 
  content_url,
  duration_minutes,
  order_index,
  difficulty_level,
  is_required
)
SELECT 
  ct.id as topic_id,
  'Practice Questions - Google Drive' as title,
  'Interactive practice questions to test your understanding' as description,
  'practice' as material_type,
  'visual' as learning_style,
  'https://drive.google.com/file/d/16vJ47ro7fEb2Qmxi9DIf0kC8SqXdPS4o/preview' as content_url,
  45 as duration_minutes,
  1 as order_index,
  'medium' as difficulty_level,
  false as is_required
FROM course_topics ct
ORDER BY ct.created_at
LIMIT 1;

-- Set up admin access by updating the first user's role to admin
-- This will allow access to the admin panel at /admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id = (
  SELECT user_id 
  FROM public.profiles 
  ORDER BY created_at 
  LIMIT 1
);