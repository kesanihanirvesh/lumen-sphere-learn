import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Trophy, ArrowLeft } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: Record<string, string>;
  correct_option: string;
  topic_id: string;
}

interface PreviousResult {
  score: number;
  total: number;
  percent: number;
  completed_at: string;
}

const QuizTaking = () => {
  const { quizType, topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previousResult, setPreviousResult] = useState<PreviousResult | null>(null);
  const [currentResult, setCurrentResult] = useState<PreviousResult | null>(null);

  const progressType = quizType === "pre-test" ? "pre_test" : "post_test";
  const label = quizType === "pre-test" ? "Pre Assessment" : "Post Assessment";

  useEffect(() => {
    if (topicId && user) {
      checkPreviousAttempt();
    }
  }, [topicId, quizType, user]);

  const checkPreviousAttempt = async () => {
    setLoading(true);

    // Check if already attempted
    const { data: existing } = await supabase
      .from("student_progress")
      .select("*")
      .eq("student_id", user!.id)
      .eq("topic_id", topicId)
      .eq("progress_type", progressType)
      .maybeSingle();

    if (existing && existing.is_completed) {
      const completionData = existing.completion_data as any;
      setPreviousResult({
        score: completionData?.score ?? existing.score ?? 0,
        total: completionData?.total ?? 0,
        percent: completionData?.percent ?? existing.score ?? 0,
        completed_at: existing.updated_at,
      });
      setLoading(false);
      return;
    }

    // No previous attempt — fetch questions
    await fetchQuestions();
  };

  const fetchQuestions = async () => {
    const tableName = quizType === "pre-test" ? "pre_assignment" : "post_assignment";

    const { data, error } = await supabase
      .from(tableName)
      .select("id, question, options, correct_option, topic_id")
      .eq("topic_id", topicId);

    setLoading(false);

    if (error) {
      console.error("Error fetching questions:", error);
      return;
    }

    setQuestions((data || []) as Question[]);
  };

  const handleSelect = (questionId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!user || !topicId) return;
    setSubmitting(true);

    let score = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_option) score++;
    });

    const percent = questions.length > 0 ? (score / questions.length) * 100 : 0;

    // Get course_id from topic
    const { data: topicData } = await supabase
      .from("course_topics")
      .select("module_id, course_modules(course_id)")
      .eq("id", topicId)
      .maybeSingle();

    const courseId = (topicData?.course_modules as any)?.course_id ?? null;

    const completionData = { score, total: questions.length, percent, answers };

    // Upsert result into student_progress
    await supabase.from("student_progress").upsert(
      {
        student_id: user.id,
        topic_id: topicId,
        course_id: courseId,
        progress_type: progressType,
        score: Math.round(percent),
        is_completed: true,
        completion_data: completionData,
        attempts: 1,
      },
      { onConflict: "student_id,topic_id,progress_type" }
    );

    setCurrentResult({ score, total: questions.length, percent, completed_at: new Date().toISOString() });
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  // Show result (either previous or just submitted)
  const result = currentResult || previousResult;
  if (result) {
    const passed = result.percent >= 70;
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4">
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Trophy className={`h-16 w-16 ${passed ? "text-yellow-500" : "text-muted-foreground"}`} />
            </div>
            <CardTitle className="text-2xl font-bold">{label} — Result</CardTitle>
            {previousResult && !currentResult && (
              <p className="text-sm text-muted-foreground mt-1">You have already completed this assessment.</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${passed ? "text-green-600" : "text-red-500"}`}>
                {result.percent.toFixed(1)}%
              </div>
              <div className="text-muted-foreground text-lg">
                {result.score} / {result.total} correct
              </div>
            </div>

            <div className="flex justify-center">
              <Badge
                variant={passed ? "default" : "destructive"}
                className="text-base px-4 py-1"
              >
                {passed ? "✓ Passed" : "✗ Not Passed"}
              </Badge>
            </div>

            {result.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Score</span>
                  <span>{result.percent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${passed ? "bg-primary" : "bg-destructive"}`}
                    style={{ width: `${result.percent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>
                Completed on {new Date(result.completed_at).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>

            <Button className="w-full" variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">No questions found</h2>
        <p className="text-muted-foreground">No questions have been added for this assessment yet.</p>
        <Button className="mt-4" variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{label}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? "s" : ""} · Single attempt only
          </p>
        </CardHeader>

        <CardContent>
          {questions.map((q, index) => (
            <div key={q.id} className="mb-8 p-4 border rounded-lg">
              <h3 className="font-semibold mb-4">
                {index + 1}. {q.question}
              </h3>

              <RadioGroup
                value={answers[q.id]}
                onValueChange={(v) => handleSelect(q.id, v)}
              >
                {Object.entries(q.options).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-3 mb-2">
                    <RadioGroupItem value={key} id={`${q.id}-${key}`} />
                    <label htmlFor={`${q.id}-${key}`} className="cursor-pointer">
                      {String(value)}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}

          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={submitting || !allAnswered}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Assessment"
            )}
          </Button>
          {!allAnswered && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please answer all questions before submitting.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizTaking;
