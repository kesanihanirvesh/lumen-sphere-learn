import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

const QuizTaking = () => {
  const { quizType, topicId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);

    const tableName =
      quizType === "pre-test" ? "pre_assignment" : "post_assignment";

    console.log("Frontend topicId:", topicId);
    console.log("Table name:", tableName);

    const { data, error } = await supabase
      .from(tableName) // FIXED
      .select("id, question, options, correct_option, topic_id")
      .eq("topic_id", topicId);

    console.log("Supabase returned:", data, error);

    setLoading(false);

    if (error) {
      console.error("Error fetching:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.warn("No questions found for topic:", topicId);
      setQuestions([]);
      return;
    }

    setQuestions(data);
  };

  useEffect(() => {
    fetchQuestions();
  }, [topicId, quizType]); // FIXED

  const handleSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    let score = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correct_option) score++;
    });

    const percent = (score / questions.length) * 100;

    setSubmitting(false);
    setSubmitted(true);

    alert(`Your Score: ${percent.toFixed(2)}%`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">No questions found</h2>
        <p className="text-gray-500">Check topic or table data.</p>
      </div>
    );

  return (
    <Card className="max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {quizType === "pre-test"
            ? "Pre Assessment"
            : "Post Assessment"} {/* FIXED */}
        </CardTitle>
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
              {Object.entries(q.options as Record<string, string>).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-3 mb-2">
                  <RadioGroupItem value={key} id={`${q.id}-${key}`} />
                  <label htmlFor={`${q.id}-${key}`}>{String(value)}</label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <Button className="w-full mt-4" onClick={handleSubmit}>
          {submitting ? "Submitting..." : "Submit"}
        </Button>

        {submitted && (
          <Button
            className="w-full mt-4"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizTaking;
