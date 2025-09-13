-- Create course_modules table for main skills (4 modules)
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  teks_standard TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_topics table for subtopics within each module
CREATE TABLE public.course_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  teks_standard TEXT,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  estimated_duration INTEGER DEFAULT 30, -- minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning_styles table to track student preferences
CREATE TABLE public.learning_styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_style TEXT NOT NULL DEFAULT 'visual' CHECK (primary_style IN ('visual', 'auditory', 'kinesthetic')),
  secondary_style TEXT CHECK (secondary_style IN ('visual', 'auditory', 'kinesthetic')),
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Create learning_materials table for content (videos, PDFs, interactive)
CREATE TABLE public.learning_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.course_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL CHECK (material_type IN ('video', 'audio', 'interactive', 'document', 'quiz', 'practice')),
  learning_style TEXT NOT NULL CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'universal')),
  content_url TEXT,
  content_data JSONB DEFAULT '{}',
  duration_minutes INTEGER DEFAULT 15,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_progress table to track learning path progress
CREATE TABLE public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.course_topics(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.learning_materials(id) ON DELETE CASCADE,
  progress_type TEXT NOT NULL CHECK (progress_type IN ('pre_test', 'material_viewed', 'practice_completed', 'post_test', 'mastery_achieved')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  mastery_level TEXT DEFAULT 'not_started' CHECK (mastery_level IN ('not_started', 'beginning', 'developing', 'proficient', 'mastered')),
  completion_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, material_id)
);

-- Create mastery_requirements table for defining completion criteria
CREATE TABLE public.mastery_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.course_topics(id) ON DELETE CASCADE,
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('pre_test_threshold', 'post_test_threshold', 'practice_accuracy', 'time_spent', 'materials_completed')),
  threshold_value INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create adaptive_recommendations table for AI-driven suggestions
CREATE TABLE public.adaptive_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.course_topics(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('learning_style_change', 'remediation', 'acceleration', 'material_suggestion')),
  current_learning_style TEXT CHECK (current_learning_style IN ('visual', 'auditory', 'kinesthetic')),
  recommended_learning_style TEXT CHECK (recommended_learning_style IN ('visual', 'auditory', 'kinesthetic')),
  reason TEXT,
  confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  is_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create updated_at triggers for all new tables
CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_topics_updated_at
  BEFORE UPDATE ON public.course_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_styles_updated_at
  BEFORE UPDATE ON public.learning_styles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_materials_updated_at
  BEFORE UPDATE ON public.learning_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at
  BEFORE UPDATE ON public.student_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_modules
CREATE POLICY "Anyone can view active course modules" 
ON public.course_modules FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.is_active = true));

CREATE POLICY "Instructors can manage their course modules" 
ON public.course_modules FOR ALL 
USING (EXISTS (SELECT 1 FROM public.courses WHERE courses.id = course_modules.course_id AND courses.instructor_id = auth.uid()));

-- RLS Policies for course_topics
CREATE POLICY "Anyone can view topics from active courses" 
ON public.course_topics FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.course_modules 
  JOIN public.courses ON courses.id = course_modules.course_id 
  WHERE course_modules.id = course_topics.module_id AND courses.is_active = true
));

CREATE POLICY "Instructors can manage their course topics" 
ON public.course_topics FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.course_modules 
  JOIN public.courses ON courses.id = course_modules.course_id 
  WHERE course_modules.id = course_topics.module_id AND courses.instructor_id = auth.uid()
));

-- RLS Policies for learning_styles
CREATE POLICY "Students can view and update their own learning style" 
ON public.learning_styles FOR ALL 
USING (auth.uid() = student_id);

CREATE POLICY "Instructors can view enrolled students' learning styles" 
ON public.learning_styles FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.enrollments 
  JOIN public.courses ON courses.id = enrollments.course_id 
  WHERE enrollments.student_id = learning_styles.student_id AND courses.instructor_id = auth.uid()
));

-- RLS Policies for learning_materials
CREATE POLICY "Students can view materials for enrolled courses" 
ON public.learning_materials FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.course_topics 
  JOIN public.course_modules ON course_modules.id = course_topics.module_id
  JOIN public.enrollments ON enrollments.course_id = course_modules.course_id
  WHERE course_topics.id = learning_materials.topic_id AND enrollments.student_id = auth.uid()
));

CREATE POLICY "Instructors can manage their course materials" 
ON public.learning_materials FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.course_topics 
  JOIN public.course_modules ON course_modules.id = course_topics.module_id
  JOIN public.courses ON courses.id = course_modules.course_id
  WHERE course_topics.id = learning_materials.topic_id AND courses.instructor_id = auth.uid()
));

-- RLS Policies for student_progress
CREATE POLICY "Students can view and update their own progress" 
ON public.student_progress FOR ALL 
USING (auth.uid() = student_id);

CREATE POLICY "Instructors can view their students' progress" 
ON public.student_progress FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = student_progress.course_id AND courses.instructor_id = auth.uid()
));

-- RLS Policies for mastery_requirements
CREATE POLICY "Students can view mastery requirements for enrolled courses" 
ON public.mastery_requirements FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.course_topics 
  JOIN public.course_modules ON course_modules.id = course_topics.module_id
  JOIN public.enrollments ON enrollments.course_id = course_modules.course_id
  WHERE course_topics.id = mastery_requirements.topic_id AND enrollments.student_id = auth.uid()
));

CREATE POLICY "Instructors can manage mastery requirements for their courses" 
ON public.mastery_requirements FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.course_topics 
  JOIN public.course_modules ON course_modules.id = course_topics.module_id
  JOIN public.courses ON courses.id = course_modules.course_id
  WHERE course_topics.id = mastery_requirements.topic_id AND courses.instructor_id = auth.uid()
));

-- RLS Policies for adaptive_recommendations
CREATE POLICY "Students can view their own recommendations" 
ON public.adaptive_recommendations FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can update their own recommendations" 
ON public.adaptive_recommendations FOR UPDATE 
USING (auth.uid() = student_id);

CREATE POLICY "Instructors can view recommendations for their students" 
ON public.adaptive_recommendations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.enrollments 
  JOIN public.courses ON courses.id = enrollments.course_id 
  WHERE enrollments.student_id = adaptive_recommendations.student_id AND courses.instructor_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_topics_module_id ON public.course_topics(module_id);
CREATE INDEX idx_learning_materials_topic_id ON public.learning_materials(topic_id);
CREATE INDEX idx_student_progress_student_id ON public.student_progress(student_id);
CREATE INDEX idx_student_progress_course_id ON public.student_progress(course_id);
CREATE INDEX idx_student_progress_topic_id ON public.student_progress(topic_id);
CREATE INDEX idx_adaptive_recommendations_student_id ON public.adaptive_recommendations(student_id);