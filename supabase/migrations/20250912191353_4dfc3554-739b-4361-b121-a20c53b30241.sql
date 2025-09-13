-- Phase 1: Database Schema Updates for Admin Dashboard and SEB Integration

-- Create student groups table
CREATE TABLE public.student_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for student groups
ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;

-- Create group memberships table
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.student_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, student_id)
);

-- Enable RLS for group memberships
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Create group enrollments table
CREATE TABLE public.group_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.student_groups(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, course_id)
);

-- Enable RLS for group enrollments
ALTER TABLE public.group_enrollments ENABLE ROW LEVEL SECURITY;

-- Add quiz type and SEB fields to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN quiz_type TEXT DEFAULT 'practice' CHECK (quiz_type IN ('pre_assessment', 'final_assessment', 'practice')),
ADD COLUMN seb_required BOOLEAN DEFAULT false,
ADD COLUMN seb_config_url TEXT;

-- Create SEB configurations table
CREATE TABLE public.seb_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  config_name TEXT NOT NULL,
  config_data JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quiz_id)
);

-- Enable RLS for SEB configurations
ALTER TABLE public.seb_configurations ENABLE ROW LEVEL SECURITY;

-- Create function to get current user role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for Student Groups
CREATE POLICY "Admins can manage all student groups" 
ON public.student_groups 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Instructors can view student groups" 
ON public.student_groups 
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'instructor'));

-- RLS Policies for Group Memberships
CREATE POLICY "Admins can manage all group memberships" 
ON public.group_memberships 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Instructors can view group memberships" 
ON public.group_memberships 
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'instructor'));

CREATE POLICY "Students can view their own group memberships" 
ON public.group_memberships 
FOR SELECT 
USING (auth.uid() = student_id);

-- RLS Policies for Group Enrollments
CREATE POLICY "Admins can manage all group enrollments" 
ON public.group_enrollments 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Instructors can view group enrollments for their courses" 
ON public.group_enrollments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = group_enrollments.course_id 
  AND courses.instructor_id = auth.uid()
));

-- RLS Policies for SEB Configurations
CREATE POLICY "Admins can manage all SEB configurations" 
ON public.seb_configurations 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Instructors can manage SEB configurations for their quizzes" 
ON public.seb_configurations 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.quizzes q
  JOIN public.courses c ON c.id = q.course_id
  WHERE q.id = seb_configurations.quiz_id 
  AND c.instructor_id = auth.uid()
));

-- Update existing courses RLS policy to allow admins
DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;
CREATE POLICY "Admins can manage all courses" 
ON public.courses 
FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Update existing profiles RLS policy to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Trigger for updated_at on student_groups
CREATE TRIGGER update_student_groups_updated_at
BEFORE UPDATE ON public.student_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on seb_configurations
CREATE TRIGGER update_seb_configurations_updated_at
BEFORE UPDATE ON public.seb_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();