import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Settings,
  Eye,
  Edit,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  is_active: boolean;
  created_at: string;
  enrollments: any[];
}

interface StudentProgress {
  student: {
    full_name: string;
  };
  course: {
    title: string;
  };
  progress: number;
  mastery_level: string;
  last_activity: string;
}

export default function InstructorDashboard() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [recentProgress, setRecentProgress] = useState<StudentProgress[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    avgProgress: 0,
    activeToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role === 'instructor') {
      fetchInstructorData();
    }
  }, [user, profile]);

  const fetchInstructorData = async () => {
    try {
      // Fetch instructor's courses with enrollment data
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          enrollments(
            id, 
            student_id, 
            progress,
            enrolled_at,
            student:profiles!enrollments_student_id_fkey(full_name)
          )
        `)
        .eq('instructor_id', user?.id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      setCourses(coursesData || []);

      // Calculate stats
      const totalStudents = new Set(
        coursesData?.flatMap(course => course.enrollments.map(e => e.student_id)) || []
      ).size;

      const allEnrollments = coursesData?.flatMap(course => course.enrollments) || [];
      const avgProgress = allEnrollments.length > 0 
        ? allEnrollments.reduce((sum, e) => sum + e.progress, 0) / allEnrollments.length 
        : 0;

      // Get recent student progress
      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select(`
          *,
          student:profiles!student_progress_student_id_fkey(full_name),
          course:courses!student_progress_course_id_fkey(title)
        `)
        .in('course_id', coursesData?.map(c => c.id) || [])
        .order('updated_at', { ascending: false })
        .limit(10);

      if (progressError) throw progressError;

      const processedProgress = progressData?.map((p: any) => ({
        student: p.student,
        course: p.course,
        progress: p.score || 0,
        mastery_level: p.mastery_level,
        last_activity: p.updated_at,
      })) || [];

      setRecentProgress(processedProgress);
      setStats({
        totalCourses: coursesData?.length || 0,
        totalStudents,
        avgProgress: Math.round(avgProgress),
        activeToday: progressData?.filter(p => {
          const today = new Date().toDateString();
          const activityDate = new Date(p.updated_at).toDateString();
          return today === activityDate;
        }).length || 0,
      });

    } catch (error) {
      console.error('Error fetching instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'instructor') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You need instructor permissions to access this dashboard.
          </p>
          <Link to="/dashboard">
            <Button>Go to Student Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid gap-6 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
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
          <div className="container mx-auto px-4 py-16">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Instructor Dashboard
                </h1>
                <p className="mt-2 text-xl text-muted-foreground">
                  Welcome back, {profile?.full_name || 'Instructor'}
                </p>
              </div>
              <Link to="/create-course">
                <Button size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgProgress}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Today</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeToday}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList>
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="progress">Student Progress</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id} className="group hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant={course.is_active ? "default" : "secondary"}
                        >
                          {course.is_active ? 'Active' : 'Inactive'}
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
                          <span>{course.enrollments?.length || 0} enrolled</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {course.difficulty_level}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/course/${course.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        <Link to={`/edit-course/${course.id}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {courses.length === 0 && (
                  <div className="col-span-full text-center py-16">
                    <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first course to get started
                    </p>
                    <Link to="/create-course">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Course
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Student Activity</CardTitle>
                  <CardDescription>
                    Latest progress updates from your students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentProgress.map((progress, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{progress.student?.full_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {progress.course?.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={progress.mastery_level === 'mastered' ? 'default' : 'secondary'}
                          >
                            {progress.mastery_level}
                          </Badge>
                          <div className="text-right">
                            <div className="text-sm font-medium">{progress.progress}%</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(progress.last_activity).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {recentProgress.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No recent activity
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Course Analytics
                  </CardTitle>
                  <CardDescription>
                    Detailed performance metrics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16 text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                    <p>Advanced analytics and reporting features will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}