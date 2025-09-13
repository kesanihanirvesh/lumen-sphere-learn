-- Create quizzes policies
CREATE POLICY "Students can view active quizzes for enrolled courses" ON public.quizzes FOR SELECT USING (
  is_active = true AND EXISTS (
    SELECT 1 FROM public.enrollments WHERE course_id = quizzes.course_id AND student_id = auth.uid()
  )
);
CREATE POLICY "Instructors can manage course quizzes" ON public.quizzes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid())
);

-- Create quiz attempts policies
CREATE POLICY "Students can view their own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their own attempts" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Instructors can view course attempts" ON public.quiz_attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_id AND c.instructor_id = auth.uid()
  )
);

-- Create questions policies
CREATE POLICY "Students can view questions during quiz attempts" ON public.questions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.quiz_attempts qa
    JOIN public.quizzes q ON q.id = qa.quiz_id
    WHERE q.id = quiz_id AND qa.student_id = auth.uid() AND qa.status = 'in_progress'
  )
);
CREATE POLICY "Instructors can manage questions" ON public.questions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.quizzes qz
    JOIN public.courses c ON c.id = qz.course_id
    WHERE qz.id = quiz_id AND c.instructor_id = auth.uid()
  )
);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();