import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function PreQuiz() {
  const { moduleId, topicId } = useParams();

  const quizId = "b98d3d81-d0e7-4ec9-b61c-5ba282786fad"; // fixed quiz_id

  const [questions, setQuestions] = useState([
    {
      id: null, // null → new question, Supabase will auto-generate
      question_text: "",
      options: [
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
      ],
      correct_answer: "a",
      points: 5,
      difficulty: "medium",
      explanation: "",
    },
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: null,
        question_text: "",
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ],
        correct_answer: "a",
        points: 5,
        difficulty: "medium",
        explanation: "",
      },
    ]);
  };

  const handleSave = async (qIndex: number) => {
    const q = questions[qIndex];
    const now = new Date().toISOString();

    if (q.id) {
      // Update existing question
      const { error } = await supabase
        .from("questions")
        .update({
          quiz_id: quizId,
          question_text: q.question_text,
          question_type: "multiple_choice",
          correct_answer: q.correct_answer,
          options: q.options,
          points: q.points,
          difficulty: q.difficulty,
          explanation: q.explanation,
          assignment_type: "pre_assessment",
          module_id: moduleId || null,
          topic_id: topicId || null,
          updated_at: now,
        })
        .eq("id", q.id);

      if (error) {
        alert("❌ Error updating: " + error.message);
      } else {
        alert("✅ Question updated!");
      }
    } else {
      // Insert new question
      const { data, error } = await supabase.from("questions").insert([
        {
          quiz_id: quizId,
          question_text: q.question_text,
          question_type: "multiple_choice",
          correct_answer: q.correct_answer,
          options: q.options,
          points: q.points,
          difficulty: q.difficulty,
          explanation: q.explanation,
          assignment_type: "pre_assessment",
          module_id: moduleId || null,
          topic_id: topicId || null,
          created_at: now,
          updated_at: now,
        },
      ]).select().single();

      if (error) {
        alert("❌ Error inserting: " + error.message);
      } else {
        alert("✅ Question added!");
        const updated = [...questions];
        updated[qIndex].id = data.id; // mark as saved
        setQuestions(updated);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Pre-Quiz Question Manager</h1>

      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          className="p-6 border rounded-lg shadow-md bg-gray-50 space-y-4"
        >
          <h2 className="font-semibold text-lg">Question {qIndex + 1}</h2>

          <textarea
            className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your question..."
            value={q.question_text}
            onChange={(e) => {
              const updated = [...questions];
              updated[qIndex].question_text = e.target.value;
              setQuestions(updated);
            }}
          />

          <div className="space-y-2">
            <label className="font-medium">Options</label>
            {q.options.map((opt, optIdx) => (
              <div key={opt.id} className="flex gap-2 items-center">
                <input
                  className="border p-2 flex-1 rounded"
                  placeholder={`Option ${opt.id.toUpperCase()}`}
                  value={opt.text}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIndex].options[optIdx].text = e.target.value;
                    setQuestions(updated);
                  }}
                />
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correct_answer === opt.id}
                  onChange={() => {
                    const updated = [...questions];
                    updated[qIndex].correct_answer = opt.id;
                    setQuestions(updated);
                  }}
                />
                <span className="text-sm">Correct</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Points</label>
              <input
                type="number"
                className="border p-2 w-full rounded"
                value={q.points}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIndex].points = parseInt(e.target.value) || 0;
                  setQuestions(updated);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Difficulty</label>
              <select
                className="border p-2 w-full rounded"
                value={q.difficulty}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIndex].difficulty = e.target.value;
                  setQuestions(updated);
                }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Explanation</label>
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Provide explanation..."
              value={q.explanation}
              onChange={(e) => {
                const updated = [...questions];
                updated[qIndex].explanation = e.target.value;
                setQuestions(updated);
              }}
            />
          </div>

          <button
            onClick={() => handleSave(qIndex)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {q.id ? "Update Question" : "Save New Question"}
          </button>
        </div>
      ))}

      <div className="text-center mt-6">
        <button
          onClick={handleAddQuestion}
          className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
        >
          ➕ Add Question
        </button>
      </div>
    </div>
  );
}
