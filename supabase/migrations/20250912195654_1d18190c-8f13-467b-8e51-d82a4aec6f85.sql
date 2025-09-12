-- Create final assessment quizzes for courses
-- First, let's add a final assessment quiz for the Geometry course
INSERT INTO public.quizzes (
  course_id,
  title,
  description,
  quiz_type,
  time_limit,
  max_attempts,
  passing_score,
  randomize_questions,
  proctored,
  seb_required,
  anti_cheat_enabled,
  is_active
)
SELECT 
  id as course_id,
  title || ' - Final Assessment' as title,
  'Comprehensive final assessment covering all topics in this course' as description,
  'final_assessment' as quiz_type,
  90 as time_limit,
  2 as max_attempts,
  75 as passing_score,
  true as randomize_questions,
  true as proctored,
  true as seb_required,
  true as anti_cheat_enabled,
  true as is_active
FROM public.courses 
WHERE is_active = true;

-- Add some sample questions for the final assessments
INSERT INTO public.questions (
  quiz_id,
  question_text,
  question_type,
  options,
  correct_answer,
  explanation,
  difficulty,
  points
)
SELECT 
  q.id as quiz_id,
  'What is the sum of interior angles in a triangle?' as question_text,
  'multiple_choice' as question_type,
  jsonb_build_array(
    jsonb_build_object('id', 'a', 'text', '90 degrees'),
    jsonb_build_object('id', 'b', 'text', '180 degrees'),
    jsonb_build_object('id', 'c', 'text', '270 degrees'),
    jsonb_build_object('id', 'd', 'text', '360 degrees')
  ) as options,
  'b' as correct_answer,
  'The sum of interior angles in any triangle is always 180 degrees.' as explanation,
  'medium' as difficulty,
  5 as points
FROM public.quizzes q
WHERE q.quiz_type = 'final_assessment'
LIMIT 1;

INSERT INTO public.questions (
  quiz_id,
  question_text,
  question_type,
  options,
  correct_answer,
  explanation,
  difficulty,
  points
)
SELECT 
  q.id as quiz_id,
  'In a right triangle, what is the relationship between the sides called?' as question_text,
  'multiple_choice' as question_type,
  jsonb_build_array(
    jsonb_build_object('id', 'a', 'text', 'Pythagorean Theorem'),
    jsonb_build_object('id', 'b', 'text', 'Law of Cosines'),
    jsonb_build_object('id', 'c', 'text', 'Law of Sines'),
    jsonb_build_object('id', 'd', 'text', 'Triangle Inequality')
  ) as options,
  'a' as correct_answer,
  'The Pythagorean Theorem states that a² + b² = c² in a right triangle.' as explanation,
  'medium' as difficulty,
  5 as points
FROM public.quizzes q
WHERE q.quiz_type = 'final_assessment'
LIMIT 1;

INSERT INTO public.questions (
  quiz_id,
  question_text,
  question_type,
  options,
  correct_answer,
  explanation,
  difficulty,
  points
)
SELECT 
  q.id as quiz_id,
  'What is the area formula for a circle?' as question_text,
  'multiple_choice' as question_type,
  jsonb_build_array(
    jsonb_build_object('id', 'a', 'text', 'πr'),
    jsonb_build_object('id', 'b', 'text', '2πr'),
    jsonb_build_object('id', 'c', 'text', 'πr²'),
    jsonb_build_object('id', 'd', 'text', 'πd²')
  ) as options,
  'c' as correct_answer,
  'The area of a circle is calculated using the formula A = πr², where r is the radius.' as explanation,
  'medium' as difficulty,
  5 as points
FROM public.quizzes q
WHERE q.quiz_type = 'final_assessment'
LIMIT 1;