import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  FileText,
  Brain,
  Target
} from 'lucide-react';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  order_index: number;
  teks_standard: string;
  topics: CourseTopic[];
}

interface CourseTopic {
  id: string;
  title: string;
  description: string;
  order_index: number;
  difficulty_level: string;
  estimated_duration: number;
  progress?: StudentProgress;
}

interface StudentProgress {
  id: string;
  mastery_level: string;
  score?: number;
  is_completed: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  instructor: {
    full_name: string;
  };
  enrollment?: {
    id: string;
    progress: number;
  };
  modules: CourseModule[];
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId && user) {
      fetchCourseDetails();
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      // Fetch course with modules, topics, and student progress
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!instructor_id(full_name),
          enrollments!left(id, progress, student_id),
          modules:course_modules(
            *,
            topics:course_topics(
              *,
              progress:student_progress!left(
                id, mastery_level, score, is_completed, student_id
              )
            )
          )
        `)
        .eq('id', courseId)
        .eq('is_active', true)
        .single();

      if (courseError) throw courseError;

      // Process the data to include enrollment and progress info
      const processedCourse = {
        ...courseData,
        enrollment: courseData.enrollments?.find((e: any) => e.student_id === user?.id),
        modules: courseData.modules
          ?.sort((a: any, b: any) => a.order_index - b.order_index)
          .map((module: any) => ({
            ...module,
            topics: module.topics
              ?.sort((a: any, b: any) => a.order_index - b.order_index)
              .map((topic: any) => ({
                ...topic,
                progress: topic.progress?.find((p: any) => p.student_id === user?.id),
              })),
          })) || [],
      };

      setCourse(processedCourse);
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLearning = async (topicId: string) => {
    try {
      // Create initial progress entry
      const { error } = await supabase
        .from('student_progress')
        .insert({
          student_id: user?.id,
          course_id: courseId,
          topic_id: topicId,
          progress_type: 'pre_test',
          mastery_level: 'beginning',
        });

      if (error && error.code !== '23505') { // Ignore duplicate key error
        throw error;
      }

      // Navigate to learning path
      window.location.href = `/learn/${topicId}`;
    } catch (error) {
      console.error('Error starting learning:', error);
    }
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'mastered': return 'bg-green-500';
      case 'proficient': return 'bg-blue-500';
      case 'developing': return 'bg-yellow-500';
      case 'beginning': return 'bg-orange-500';
      default: return 'bg-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link to="/courses">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/courses" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>

        {/* Course Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{course.description}</p>
              <div className="flex items-center gap-4">
                <Badge>{course.difficulty_level}</Badge>
                <Badge variant="outline">{course.category}</Badge>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>by {course.instructor?.full_name}</span>
                </div>
              </div>
            </div>
            {course.enrollment && (
              <div className="ml-8 text-right">
                <div className="text-sm text-muted-foreground mb-2">Overall Progress</div>
                <div className="text-2xl font-bold mb-2">{course.enrollment.progress}%</div>
                <Progress value={course.enrollment.progress} className="w-32" />
              </div>
            )}
          </div>
        </div>

        {/* Course Content */}
        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList>
            <TabsTrigger value="modules">Learning Modules</TabsTrigger>
            <TabsTrigger value="overview">Course Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-6">
            {course.modules.map((module, moduleIndex) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Module {moduleIndex + 1}: {module.title}
                        <Badge variant="outline" className="text-xs">
                          {module.teks_standard}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {module.topics.map((topic, topicIndex) => (
                      <Card key={topic.id} className="border-muted">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{topic.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{topic.description}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{topic.estimated_duration} min</span>
                                <Badge variant="secondary" className="text-xs">
                                  {topic.difficulty_level}
                                </Badge>
                              </div>
                            </div>
                            {topic.progress && (
                              <div className="ml-2">
                                <div className={`w-3 h-3 rounded-full ${getMasteryColor(topic.progress.mastery_level)}`} />
                              </div>
                            )}
                          </div>

                          {topic.progress ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Mastery: {topic.progress.mastery_level}</span>
                                {topic.progress.score && (
                                  <span>{topic.progress.score}%</span>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => startLearning(topic.id)}
                              >
                                {topic.progress.is_completed ? (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Review
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Continue
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => startLearning(topic.id)}
                            >
                              <Target className="mr-2 h-4 w-4" />
                              Start Learning
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Adaptive Learning Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold mb-1">Pre-Assessment</h3>
                    <p className="text-sm text-muted-foreground">
                      Gauge baseline knowledge before starting each topic
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold mb-1">Adaptive Content</h3>
                    <p className="text-sm text-muted-foreground">
                      Personalized materials based on your learning style
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold mb-1">Mastery Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Progress unlocks only after demonstrating understanding
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Learning Styles Supported:</h3>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="flex items-center gap-2 p-3 border rounded">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium">Visual:</span>
                      <span className="text-sm text-muted-foreground">Diagrams, animations</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm font-medium">Auditory:</span>
                      <span className="text-sm text-muted-foreground">Narrated lessons</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded">
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                      <span className="text-sm font-medium">Kinesthetic:</span>
                      <span className="text-sm text-muted-foreground">Interactive practice</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}