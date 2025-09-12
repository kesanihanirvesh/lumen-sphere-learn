import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Play, 
  Book, 
  Headphones, 
  MousePointer2,
  CheckCircle,
  Clock,
  Target,
  Brain,
  RotateCcw,
  Eye,
  ArrowRight
} from 'lucide-react';

interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  material_type: string;
  learning_style: string;
  content_url?: string;
  content_data: any;
  duration_minutes: number;
  difficulty_level: string;
  is_required: boolean;
  order_index: number;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration: number;
  module: {
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
  materials: LearningMaterial[];
  progress?: any;
}

interface LearningStyle {
  primary_style: string;
  secondary_style?: string;
  confidence_score: number;
}

export default function LearningPath() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [learningStyle, setLearningStyle] = useState<LearningStyle | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'pre_test' | 'learning' | 'practice' | 'post_test'>('pre_test');
  const [loading, setLoading] = useState(true);
  const [quizAttempts, setQuizAttempts] = useState<any>({});
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (topicId && user) {
      fetchTopicAndProgress();
      fetchLearningStyle();
      fetchQuizAttempts();
    }
  }, [topicId, user]);

  // Add refresh logic to detect completed assessments
  useEffect(() => {
    const handleFocus = () => {
      if (topicId && user) {
        fetchQuizAttempts();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && topicId && user) {
        fetchQuizAttempts();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [topicId, user]);

  const fetchTopicAndProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('course_topics')
        .select(`
          *,
          module:course_modules(
            title,
            course:courses(id, title)
          ),
          materials:learning_materials(*),
          progress:student_progress!left(*, student_id)
        `)
        .eq('id', topicId)
        .single();

      if (error) throw error;

      const topicData = {
        ...data,
        progress: data.progress?.find((p: any) => p.student_id === user?.id),
      };

      setTopic(topicData);

      // Calculate overall progress and determine current phase
      const { phase, progress } = calculateProgressAndPhase(topicData);
      setCurrentPhase(phase);
      setOverallProgress(progress);
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLearningStyle = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_styles')
        .select('*')
        .eq('student_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setLearningStyle(data || { primary_style: 'visual', confidence_score: 50 });
    } catch (error) {
      console.error('Error fetching learning style:', error);
    }
  };

  const fetchQuizAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('student_id', user?.id)
        .or(`quiz_id.eq.${topicId}-pre-test,quiz_id.eq.quiz-${topicId}-pre-test,quiz_id.eq.${topicId}-post-test,quiz_id.eq.quiz-${topicId}-post-test`)
        .in('status', ['completed', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      
      const attempts: any = {};
      data?.forEach((attempt: any) => {
        if (attempt.quiz_id.includes('pre-test') && !attempts.preTest) {
          attempts.preTest = attempt;
        } else if (attempt.quiz_id.includes('post-test') && !attempts.postTest) {
          attempts.postTest = attempt;
        }
      });
      
      setQuizAttempts(attempts);
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
    }
  };

  const calculateProgressAndPhase = (topicData: any) => {
    const hasPreTest = quizAttempts.preTest?.status === 'completed';
    const hasPostTest = quizAttempts.postTest?.status === 'completed';
    const materialsCount = topicData.materials?.length || 0;
    const completedMaterials = topicData.progress?.filter((p: any) => 
      p.progress_type === 'material' && p.is_completed
    )?.length || 0;

    let progress = 0;
    let phase: 'pre_test' | 'learning' | 'practice' | 'post_test' = 'pre_test';

    // Phase 1: Pre-test (25% when completed)
    if (hasPreTest) {
      progress += 25;
      phase = 'learning';
      
      // Phase 2: Learning materials (50% when all completed)
      if (materialsCount > 0) {
        const materialProgress = Math.min((completedMaterials / materialsCount) * 50, 50);
        progress += materialProgress;
        
        if (completedMaterials === materialsCount) {
          phase = 'practice';
          
          // Phase 3: Practice (75% when engaged)
          progress += 15; // Assume practice engagement
          phase = 'post_test';
          
          // Phase 4: Post-test (100% when completed)
          if (hasPostTest) {
            progress = 100;
          }
        }
      }
    }

    return { phase, progress: Math.min(progress, 100) };
  };

  const getFilteredMaterials = () => {
    if (!topic || !learningStyle) return [];
    
    return topic.materials
      .filter(material => 
        material.learning_style === learningStyle.primary_style || 
        material.learning_style === 'universal'
      )
      .sort((a, b) => a.order_index - b.order_index);
  };

  const getStyleIcon = (style: string) => {
    switch (style) {
      case 'visual': return Book;
      case 'auditory': return Headphones;
      case 'kinesthetic': return MousePointer2;
      default: return Book;
    }
  };

  const updateProgress = async (progressType: string, score?: number) => {
    try {
      const { error } = await supabase
        .from('student_progress')
        .upsert({
          student_id: user?.id,
          course_id: topic?.module?.course?.id,
          topic_id: topicId,
          progress_type: progressType,
          score,
          is_completed: progressType === 'post_test' && (score || 0) >= 70,
          mastery_level: (score || 0) >= 90 ? 'mastered' : 
                         (score || 0) >= 80 ? 'proficient' :
                         (score || 0) >= 70 ? 'developing' : 'beginning',
        });

      if (error) throw error;

      // Update enrollment progress
      await updateEnrollmentProgress();
      
      // Refresh topic and progress data
      await fetchTopicAndProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const updateEnrollmentProgress = async () => {
    try {
      // Calculate overall course progress based on all topics
      const { data: allTopics } = await supabase
        .from('course_topics')
        .select(`
          id,
          progress:student_progress!left(is_completed, student_id)
        `)
        .eq('course_modules.course_id', topic?.module?.course?.id);

      if (allTopics) {
        const completedTopics = allTopics.filter(t => 
          t.progress?.some((p: any) => p.student_id === user?.id && p.is_completed)
        ).length;
        
        const overallProgress = Math.round((completedTopics / allTopics.length) * 100);

        await supabase
          .from('enrollments')
          .update({ progress: overallProgress })
          .eq('student_id', user?.id)
          .eq('course_id', topic?.module?.course?.id);
      }
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
    }
  };

  const enrollInCourse = async () => {
    try {
      await supabase.from('enrollments').insert({
        student_id: user?.id,
        course_id: topic?.module?.course?.id,
      });
      await fetchTopicAndProgress();
    } catch (error) {
      console.error('Error enrolling in course:', error);
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

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const StyleIcon = getStyleIcon(learningStyle?.primary_style || 'visual');

  return (
    <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/course/${topic.module.course.id}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {topic.module.course.title}
          </Button>
        </div>

        {/* Learning Path Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <span>{topic.module.title}</span>
            <span>/</span>
            <span className="text-foreground font-medium">{topic.title}</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">{topic.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{topic.description}</p>
          
          <div className="flex items-center gap-4">
            <Badge>{topic.difficulty_level}</Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{topic.estimated_duration} min</span>
            </div>
            <div className="flex items-center gap-2">
              <StyleIcon className="h-4 w-4 text-primary" />
              <span className="text-sm">
                Optimized for {learningStyle?.primary_style || 'visual'} learning
              </span>
            </div>
          </div>
        </div>

        {/* Learning Path Phases */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Learning Pathway</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Progress:</span>
                <span className="font-semibold text-foreground">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            {['pre_test', 'learning', 'practice', 'post_test'].map((phase, index) => {
              const isCompleted = index < ['pre_test', 'learning', 'practice', 'post_test'].indexOf(currentPhase);
              const isCurrent = currentPhase === phase;
              
              return (
                <div key={phase} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium
                    ${isCurrent ? 'border-primary bg-primary text-primary-foreground' : 
                      isCompleted ? 'border-green-500 bg-green-500 text-white' :
                      'border-muted bg-muted text-muted-foreground'}`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < 3 && <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Phase Content */}
        <Tabs value={currentPhase} onValueChange={(value) => setCurrentPhase(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pre_test">Pre-Assessment</TabsTrigger>
            <TabsTrigger value="learning">Learning Materials</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="post_test">Post-Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="pre_test" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Pre-Assessment
                </CardTitle>
                <CardDescription>
                  Let's check your baseline knowledge to personalize your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  {quizAttempts.preTest ? (
                    // Show completed assessment results - no retakes allowed
                    <div className="space-y-4">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                      <h3 className="text-xl font-semibold mb-2">Pre-Assessment Complete!</h3>
                      <div className="flex justify-center gap-4 mb-4">
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          Final Score: {quizAttempts.preTest.score || 0}%
                        </Badge>
                        <Badge variant={
                          (quizAttempts.preTest.score || 0) >= 90 ? 'default' : 
                          (quizAttempts.preTest.score || 0) >= 80 ? 'default' : 
                          (quizAttempts.preTest.score || 0) >= 70 ? 'secondary' : 'destructive'
                        }>
                          Level: {
                            (quizAttempts.preTest.score || 0) >= 90 ? 'Mastered' : 
                            (quizAttempts.preTest.score || 0) >= 80 ? 'Proficient' : 
                            (quizAttempts.preTest.score || 0) >= 70 ? 'Developing' : 'Beginning'
                          }
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-6">
                        {quizAttempts.preTest.status === 'completed' 
                          ? "Assessment completed! Your score has been saved and you can now proceed to learning materials."
                          : "Assessment in progress. Please complete it to see your results."
                        }
                      </p>
                      {quizAttempts.preTest.status === 'completed' ? (
                        <Button 
                          size="lg"
                          onClick={() => navigate(`/quiz/pre-test/${topicId}`)}
                          variant="outline"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Results
                        </Button>
                      ) : (
                        <Button 
                          size="lg"
                          onClick={() => navigate(`/quiz/pre-test/${topicId}`)}
                        >
                          Continue Assessment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    // Show start assessment
                    <div>
                      <Brain className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">Ready to start?</h3>
                      <p className="text-muted-foreground mb-6">
                        This quick assessment helps us understand what you already know
                      </p>
                      <Button 
                        size="lg"
                        onClick={() => {
                          // Navigate to quiz component
                          navigate(`/quiz/pre-test/${topicId}`);
                        }}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Start Pre-Assessment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="learning" className="mt-6">
            {getFilteredMaterials().filter(m => ['video', 'audio', 'document'].includes(m.material_type)).length === 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>No materials available</CardTitle>
                  <CardDescription>
                    You might need to enroll in this course to access learning materials.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button onClick={enrollInCourse}>Enroll in course</Button>
                    <Button variant="outline" onClick={fetchTopicAndProgress}>Refresh</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="grid gap-6">
              {getFilteredMaterials()
                .filter(m => ['video', 'audio', 'document'].includes(m.material_type))
                .map((material) => (
                  <Card key={material.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <StyleIcon className="h-5 w-5" />
                            {material.title}
                          </CardTitle>
                          <CardDescription>{material.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{material.material_type}</Badge>
                          <div className="text-sm text-muted-foreground">
                            {material.duration_minutes} min
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                         <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                           {material.content_url ? (
                             <iframe
                               src={material.content_url}
                               title={material.title}
                               className="w-full h-full rounded-lg"
                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                               referrerPolicy="strict-origin-when-cross-origin"
                               allowFullScreen
                             />
                           ) : (
                             <div className="text-center">
                               <StyleIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                               <p className="text-muted-foreground">Content will be available soon</p>
                               <p className="text-sm text-muted-foreground mt-1">
                                 {material.material_type} • {material.duration_minutes} min
                               </p>
                             </div>
                           )}
                         </div>
                        <Button 
                          className="w-full"
                          onClick={() => updateProgress('material_viewed')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="practice" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Exercises</CardTitle>
                <CardDescription>
                  Apply what you've learned with interactive exercises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {getFilteredMaterials()
                    .filter(m => m.material_type === 'practice')
                    .map((material) => (
                      <div key={material.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">{material.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{material.description}</p>
                        <Button>
                          <Play className="mr-2 h-4 w-4" />
                          Start Practice
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post_test" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Post-Assessment
                </CardTitle>
                <CardDescription>
                  Demonstrate your mastery to unlock the next topic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                   {quizAttempts.postTest ? (
                     // Show completed assessment results - no retakes allowed
                     <div className="space-y-4">
                       <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                       <h3 className="text-xl font-semibold mb-2">Final Assessment Complete!</h3>
                       <div className="flex justify-center gap-4 mb-4">
                         <Badge variant="outline" className="text-lg px-4 py-2">
                           Final Score: {quizAttempts.postTest.score || 0}%
                         </Badge>
                         <Badge variant={
                           (quizAttempts.postTest.score || 0) >= 90 ? 'default' : 
                           (quizAttempts.postTest.score || 0) >= 80 ? 'default' : 
                           (quizAttempts.postTest.score || 0) >= 70 ? 'secondary' : 'destructive'
                         }>
                           Level: {
                             (quizAttempts.postTest.score || 0) >= 90 ? 'Mastered' : 
                             (quizAttempts.postTest.score || 0) >= 80 ? 'Proficient' : 
                             (quizAttempts.postTest.score || 0) >= 70 ? 'Developing' : 'Beginning'
                           }
                         </Badge>
                       </div>
                       <div className="text-center">
                         <Badge variant={
                           (quizAttempts.postTest.score || 0) >= 70 ? 'default' : 'destructive'
                         } className="text-lg px-6 py-2 mb-4">
                           {(quizAttempts.postTest.score || 0) >= 70 ? 'PASSED' : 'NOT PASSED'}
                         </Badge>
                       </div>
                       <p className="text-muted-foreground mb-6">
                         {quizAttempts.postTest.status === 'completed' 
                           ? "Final assessment completed! Your score has been permanently saved."
                           : "Assessment in progress. Please complete it to see your final results."
                         }
                       </p>
                       {quizAttempts.postTest.status === 'completed' ? (
                         <Button 
                           size="lg"
                           onClick={() => navigate(`/quiz/post-test/${topicId}`)}
                           variant="outline"
                         >
                           <Eye className="mr-2 h-4 w-4" />
                           View Results
                         </Button>
                       ) : (
                         <Button 
                           size="lg"
                           onClick={() => navigate(`/quiz/post-test/${topicId}`)}
                         >
                           Continue Assessment
                           <ArrowRight className="ml-2 h-4 w-4" />
                         </Button>
                       )}
                     </div>
                   ) : (
                    // Show start assessment
                    <div>
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-xl font-semibold mb-2">Ready for your final assessment?</h3>
                      <p className="text-muted-foreground mb-6">
                        Score 70% or higher to demonstrate mastery and unlock the next topic
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          size="lg"
                          onClick={() => navigate(`/quiz/post-test/${topicId}`)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Final Assessment
                        </Button>
                        <Button variant="outline" size="lg">
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Review Materials
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}