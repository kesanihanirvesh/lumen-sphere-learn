import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  difficulty: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit?: number;
  max_attempts: number;
  passing_score: number;
  questions: Question[];
}

interface QuizAttempt {
  id: string;
  answers: any;
  started_at: string;
  status: string;
}

export default function QuizTaking() {
  const { quizType, topicId } = useParams<{ quizType: string; topicId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [reviewMode, setReviewMode] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (topicId && user) {
      fetchQuizAndAttempt();
    }
  }, [topicId, user, quizType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timeRemaining && timeRemaining > 0 && !showResults) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timeRemaining, showResults]);

  const fetchQuizAndAttempt = async () => {
    try {
      // Build mock quiz for this topic
      const quizTitle = quizType === 'pre-test' ? 'Pre-Assessment' : 'Post-Assessment';
      const sampleQuestions = generateSampleQuestions();
      const quizId = `quiz-${topicId}-${quizType}`;
      const mockQuiz: Quiz = {
        id: quizId,
        title: quizTitle,
        description: `${quizTitle} for this topic to evaluate your understanding.`,
        time_limit: quizType === 'post-test' ? 30 : 15, // minutes
        max_attempts: 1, // Only allow one attempt
        passing_score: 70,
        questions: sampleQuestions
      };
      setQuiz(mockQuiz);

      // Fetch course id for progress tracking
      const { data: topicRow } = await supabase
        .from('course_topics')
        .select('module:course_modules(course:courses(id))')
        .eq('id', topicId)
        .maybeSingle();
      setCourseId((topicRow as any)?.module?.course?.id ?? null);

      // Check for ANY attempt (completed or in_progress) to prevent retaking
      const { data: existingAttempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('student_id', user?.id)
        .or(`quiz_id.eq.${quizId},quiz_id.eq.${topicId}-${quizType}`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existingAttempts && existingAttempts.length > 0) {
        const existingAttempt = existingAttempts[0];
        
        if (existingAttempt.status === 'completed') {
          // Show completed results - no retakes allowed
          setAttempt(existingAttempt as QuizAttempt);
          setAnswers((existingAttempt.answers as Record<string, string>) || {});
          setScore(existingAttempt.score || 0);
          setShowResults(true);
          return;
        } else if (existingAttempt.status === 'in_progress') {
          // Resume existing attempt
          setAttempt(existingAttempt as QuizAttempt);
          setAnswers((existingAttempt.answers as Record<string, string>) || {});

          // Calculate time remaining
          const startTime = new Date(existingAttempt.started_at).getTime();
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const totalTime = (mockQuiz.time_limit || 30) * 60;
          const timeLeft = Math.max(0, totalTime - elapsed);
          
          if (timeLeft === 0) {
            // Time expired, auto-submit
            submitQuiz();
            return;
          }
          
          setTimeRemaining(timeLeft);
          return;
        }
      }

      // Create new attempt - only if no previous attempts exist
      const { data: newAttempt, error: createError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quizId,
          student_id: user?.id,
          status: 'in_progress',
          answers: {},
          started_at: new Date().toISOString()
        })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('Error creating attempt:', createError);
        // Fallback to local attempt
        setAttempt({ id: 'local', answers: {}, started_at: new Date().toISOString(), status: 'in_progress' } as any);
      } else {
        setAttempt(newAttempt as QuizAttempt);
      }
      
      setTimeRemaining((mockQuiz.time_limit || 30) * 60);
      
    } catch (error) {
      console.error('Error fetching quiz:', error);
      // Fallback to local attempt only if absolutely necessary
      setAttempt({ id: 'local', answers: {}, started_at: new Date().toISOString(), status: 'in_progress' } as any);
      setTimeRemaining(((quiz?.time_limit ?? 30) as number) * 60);
    } finally {
      setLoading(false);
    }
  };
  const generateSampleQuestions = (): Question[] => {
    const questions = [
      {
        id: '1',
        question_text: 'What is the distance between points A(2, 3) and B(6, 6)?',
        question_type: 'multiple_choice',
        options: ['3 units', '5 units', '7 units', '25 units'],
        correct_answer: '5 units',
        explanation: 'Using the distance formula: d = √[(6-2)² + (6-3)²] = √[16 + 9] = √25 = 5 units',
        points: 4,
        difficulty: 'medium'
      },
      {
        id: '2',
        question_text: 'Which of the following represents the midpoint of the line segment connecting (-2, 4) and (8, -2)?',
        question_type: 'multiple_choice',
        options: ['(3, 1)', '(5, 2)', '(6, 2)', '(10, -6)'],
        correct_answer: '(3, 1)',
        explanation: 'Midpoint formula: M = ((x₁+x₂)/2, (y₁+y₂)/2) = ((-2+8)/2, (4-2)/2) = (3, 1)',
        points: 4,
        difficulty: 'medium'
      },
      {
        id: '3',
        question_text: 'If two lines are perpendicular, what is the relationship between their slopes?',
        question_type: 'multiple_choice',
        options: ['They are equal', 'They are opposite', 'They are negative reciprocals', 'They sum to zero'],
        correct_answer: 'They are negative reciprocals',
        explanation: 'Perpendicular lines have slopes that are negative reciprocals of each other (m₁ × m₂ = -1)',
        points: 3,
        difficulty: 'easy'
      },
      {
        id: '4',
        question_text: 'A transformation that preserves size and shape is called:',
        question_type: 'multiple_choice',
        options: ['Dilation', 'Rigid transformation', 'Non-rigid transformation', 'Similarity transformation'],
        correct_answer: 'Rigid transformation',
        explanation: 'Rigid transformations (translations, rotations, reflections) preserve both size and shape',
        points: 3,
        difficulty: 'easy'
      },
      {
        id: '5',
        question_text: 'What is the contrapositive of "If a triangle is equilateral, then it is isosceles"?',
        question_type: 'multiple_choice',
        options: [
          'If a triangle is isosceles, then it is equilateral',
          'If a triangle is not equilateral, then it is not isosceles',
          'If a triangle is not isosceles, then it is not equilateral',
          'A triangle is equilateral if and only if it is isosceles'
        ],
        correct_answer: 'If a triangle is not isosceles, then it is not equilateral',
        explanation: 'The contrapositive of "If p, then q" is "If not q, then not p"',
        points: 4,
        difficulty: 'hard'
      }
    ];
    
    return questions.slice(0, quizType === 'pre-test' ? 3 : 5);
  };

  const updateAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    // Update attempt in database
    if (attempt) {
      supabase
        .from('quiz_attempts')
        .update({ answers: newAnswers })
        .eq('id', attempt.id)
        .then();
    }
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    
    let correct = 0;
    let totalPoints = 0;
    
    quiz.questions.forEach(question => {
      totalPoints += question.points;
      if (answers[question.id] === question.correct_answer) {
        correct += question.points;
      }
    });
    
    return totalPoints > 0 ? Math.round((correct / totalPoints) * 100) : 0;
  };

  const submitQuiz = async () => {
    if (!quiz) return;
    
    const finalScore = calculateScore();
    setScore(finalScore);
    
    try {
      // Always try to save to database - create attempt if doesn't exist
      let attemptId = attempt?.id;
      
      if (!attemptId || attemptId === 'local') {
        // Create new attempt record
        const { data: newAttempt } = await supabase
          .from('quiz_attempts')
          .insert({
            quiz_id: `quiz-${topicId}-${quizType}`, // Use a valid format
            student_id: user?.id,
            status: 'completed',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            score: finalScore,
            answers: answers
          })
          .select()
          .maybeSingle();
        
        if (newAttempt) {
          setAttempt(newAttempt as QuizAttempt);
          attemptId = newAttempt.id;
        }
      } else {
        // Update existing attempt
        await supabase
          .from('quiz_attempts')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            score: finalScore,
            answers: answers
          })
          .eq('id', attemptId);
      }

      // Save progress to student_progress table
      if (courseId && topicId) {
        await supabase
          .from('student_progress')
          .upsert({
            student_id: user?.id,
            course_id: courseId,
            topic_id: topicId,
            progress_type: quizType === 'pre-test' ? 'pre_test' : 'post_test',
            score: finalScore,
            is_completed: true,
            mastery_level: finalScore >= 90 ? 'mastered' : 
                           finalScore >= 80 ? 'proficient' :
                           finalScore >= 70 ? 'developing' : 'beginning'
          }, {
            onConflict: 'student_id,course_id,topic_id,progress_type'
          });
      }
      
      // Show results
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Even if database fails, still show results locally
      setShowResults(true);
    }
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFlag = (questionIndex: number) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionIndex)) {
      newFlagged.delete(questionIndex);
    } else {
      newFlagged.add(questionIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  if (loading || !quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-muted rounded w-64 mb-4" />
          <div className="h-4 bg-muted rounded w-48" />
        </div>
      </div>
    );
  }

  if (showResults && !reviewMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">
                {attempt && (attempt as any).status === 'completed' ? 'Quiz Results' : 'Quiz Complete!'}
              </CardTitle>
              <CardDescription>
                {attempt && (attempt as any).status === 'completed' 
                  ? 'You have already completed this quiz. Here are your results:' 
                  : 'Here are your results'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl font-bold mb-4">
                {score}%
              </div>
              
              <div className="flex justify-center">
                <Badge 
                  variant={score >= quiz.passing_score ? "default" : "destructive"}
                  className="text-lg px-4 py-2"
                >
                  {score >= quiz.passing_score ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Passed
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Not Passed
                    </>
                  )}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 max-w-md mx-auto">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-semibold">{quiz.questions.filter(q => answers[q.id] === q.correct_answer).length}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-semibold">{quiz.questions.length}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => setReviewMode(true)}
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Review Answers
                </Button>
                <Button onClick={() => navigate(`/learn/${topicId}`)}>
                  End Review & Continue Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (reviewMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Review: {quiz.title}</h1>
            <Button onClick={() => setReviewMode(false)} variant="outline">
              <EyeOff className="mr-2 h-4 w-4" />
              Exit Review
            </Button>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <Badge variant="secondary">Score: {score}%</Badge>
            <Badge variant={score >= 90 ? 'default' : score >= 80 ? 'default' : score >= 70 ? 'secondary' : 'destructive'}>
              Level: {score >= 90 ? 'mastered' : score >= 80 ? 'proficient' : score >= 70 ? 'developing' : 'beginning'}
            </Badge>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((question, index) => (
              <Card key={question.id} className="border-l-4 border-l-muted">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      Question {index + 1}
                    </CardTitle>
                    <Badge variant={answers[question.id] === question.correct_answer ? "default" : "destructive"}>
                      {answers[question.id] === question.correct_answer ? "Correct" : "Incorrect"}
                    </Badge>
                  </div>
                  <CardDescription>{question.question_text}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => {
                      const isCorrect = option === question.correct_answer;
                      const isSelected = answers[question.id] === option;
                      
                      return (
                        <div 
                          key={optionIndex}
                          className={`p-3 rounded border ${
                            isCorrect ? 'border-green-500 bg-green-50' : 
                            isSelected && !isCorrect ? 'border-red-500 bg-red-50' : 
                            'border-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {isSelected && !isCorrect && <AlertCircle className="h-4 w-4 text-red-600" />}
                            <span>{option}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {question.explanation && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                      <div className="font-medium text-blue-900 mb-1">Explanation:</div>
                      <div className="text-blue-800">{question.explanation}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button 
              onClick={() => navigate(`/learn/${topicId}`)} 
              size="lg"
              className="min-w-40"
            >
              End Review & Continue Learning
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <p className="text-muted-foreground">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className={timeRemaining < 300 ? 'text-red-600 font-semibold' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {currentQ.question_text}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentQ.difficulty}</Badge>
                <Badge variant="secondary">{currentQ.points} pts</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFlag(currentQuestion)}
                  className={flaggedQuestions.has(currentQuestion) ? 'text-yellow-600' : ''}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={answers[currentQ.id] || ''} 
              onValueChange={(value) => updateAnswer(currentQ.id, value)}
            >
              {currentQ.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded hover:bg-muted/50">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {flaggedQuestions.size > 0 && (
              <Badge variant="outline" className="text-yellow-600">
                <Flag className="mr-1 h-3 w-3" />
                {flaggedQuestions.size} flagged
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {Object.keys(answers).length} / {quiz.questions.length} answered
            </span>
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button onClick={submitQuiz}>
              Submit Quiz
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}