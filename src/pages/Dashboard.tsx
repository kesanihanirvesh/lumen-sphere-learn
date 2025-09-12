import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FloatingShapes } from '@/components/3d/FloatingShapes';
import { supabase } from '@/integrations/supabase/client';
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  Users,
  Play,
  ChevronRight,
  BarChart3,
  Target
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  thumbnail_url?: string;
}

interface Enrollment {
  id: string;
  progress: number;
  enrolled_at: string;
  course: Course;
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('student_id', user?.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(enrollment => ({
        ...enrollment,
        course: enrollment.courses
      })) || [];
      
      setEnrollments(transformedData);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-gradient">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 hero-gradient rounded-2xl animate-pulse mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.progress === 100).length;
  const averageProgress = totalCourses > 0 
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses)
    : 0;

  const stats = [
    {
      title: 'Enrolled Courses',
      value: totalCourses,
      icon: BookOpen,
      color: 'text-primary'
    },
    {
      title: 'Completed',
      value: completedCourses,
      icon: Award,
      color: 'text-success'
    },
    {
      title: 'Average Progress',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      color: 'text-secondary'
    },
    {
      title: 'Learning Hours',
      value: Math.round(totalCourses * 2.5),
      icon: Clock,
      color: 'text-accent'
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Background */}
      <div className="fixed inset-0 mesh-gradient">
        <FloatingShapes />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-slide-up-fade">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {profile?.full_name?.split(' ')[0] || 'Learner'}
            </span>! 
          </h1>
          <p className="text-muted-foreground text-lg">
            Continue your learning journey with EduSphere
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card card-3d animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Courses */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Courses</h2>
              <Button variant="outline" className="btn-glass" onClick={() => navigate('/courses')}>
                Browse Courses
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {enrollments.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start your learning journey by enrolling in your first course
                  </p>
                  <Button className="btn-hero" onClick={() => navigate('/courses')}>
                    Explore Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {enrollments.slice(0, 3).map((enrollment, index) => (
                  <Card key={enrollment.id} className="glass-card card-3d animate-slide-up-fade" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                          <CardDescription>
                            {enrollment.course.category} • {enrollment.course.difficulty_level}
                          </CardDescription>
                        </div>
                        <Button 
                          size="sm" 
                          className="btn-glass"
                          onClick={() => navigate(`/course/${enrollment.course.id}`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start btn-glass" onClick={() => navigate('/courses')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
                <Button variant="outline" className="w-full justify-start btn-glass" onClick={() => navigate('/profile')}>
                  <Users className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start btn-glass" onClick={() => navigate('/analytics')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrollments.length > 0 ? (
                  <div className="space-y-3">
                    {enrollments.slice(0, 3).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div>
                          <p className="font-medium">Enrolled in {enrollment.course.title}</p>
                          <p className="text-muted-foreground">
                            {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* Achievement */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="w-16 h-16 hero-gradient rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">Learning Pioneer</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your first course to unlock achievements
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}