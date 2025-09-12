import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, TrendingUp } from 'lucide-react';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { GeometryCourseSeeder } from '@/components/course/GeometryCourseSeeder';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  thumbnail_url?: string;
  instructor: {
    full_name: string;
  };
  _count?: {
    enrollments: number;
  };
  enrollment?: {
    id: string;
    progress: number;
  };
}

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      // Fetch active courses with enrollment info
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(full_name),
          enrollments!left(id, progress, student_id)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const coursesWithEnrollment = data?.map((course: any) => ({
        ...course,
        enrollment: course.enrollments?.find((e: any) => e.student_id === user?.id),
        _count: {
          enrollments: course.enrollments?.length || 0,
        },
      })) || [];

      setCourses(coursesWithEnrollment);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          course_id: courseId,
          student_id: user?.id,
          progress: 0,
        });

      if (error) throw error;
      
      fetchCourses(); // Refresh courses
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary fallback={<div />}>
        <FloatingShapes />
      </ErrorBoundary>
      
      <div className="relative z-10">
        <section className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Explore Courses
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover adaptive learning paths designed to match your learning style and pace
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {courses.length === 0 && (
            <div className="mb-8">
              <GeometryCourseSeeder onCourseCreated={fetchCourses} />
            </div>
          )}
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={course.difficulty_level === 'beginner' ? 'default' : 
                                   course.difficulty_level === 'intermediate' ? 'secondary' : 'destructive'}>
                      {course.difficulty_level}
                    </Badge>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course._count?.enrollments || 0} enrolled</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>by {course.instructor?.full_name || 'Instructor'}</span>
                    </div>
                  </div>

                  {course.enrollment ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.enrollment.progress}%</span>
                      </div>
                      <Progress value={course.enrollment.progress} className="h-2" />
                      <Link to={`/course/${course.id}`}>
                        <Button className="w-full">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => enrollInCourse(course.id)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Enroll Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses available</h3>
              <p className="text-muted-foreground">Check back later for new courses!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}